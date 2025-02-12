"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { ref, get, set, push } from "firebase/database";

export default function Home() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState<number | null>(null);
    const [kickCountdown, setKickCountdown] = useState<number | null>(null);

    const RATE_LIMIT_TIME = 10000; // time it takes to create a new lobby
    const KICK_BAN_TIME = 10000; // time for a kicked player to rejoin

    useEffect(() => {
        document.title = "Artic Cone Home";
        cleanupEmptyLobbies();

        const lastCreatedLobbyTime = localStorage.getItem("lastLobbyCreated");
        const lastKickedTime = localStorage.getItem("lastKicked");

        if (lastCreatedLobbyTime) {
            const updateCountdown = () => {
                const elapsedTime = Date.now() - parseInt(lastCreatedLobbyTime);
                const remainingTime = Math.ceil((RATE_LIMIT_TIME - elapsedTime) / 1000);
                if (remainingTime > 0) {
                    setCountdown(remainingTime);
                } else {
                    setCountdown(null);
                }
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
        }

        if (lastKickedTime) {
            const updateKickCountdown = () => {
                const elapsedTime = Date.now() - parseInt(lastKickedTime);
                const remainingTime = Math.ceil((KICK_BAN_TIME - elapsedTime) / 1000);
                if (remainingTime > 0) {
                    setKickCountdown(remainingTime);
                } else {
                    setKickCountdown(null);
                }
            };

            updateKickCountdown();
            const interval = setInterval(updateKickCountdown, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    const checkAndJoinLobby = async () => {
        if (!playerName.trim() || !lobbyCode.trim()) {
            setError("Please enter a lobby code and your name.");
            return;
        }

        const lastKickedTime = localStorage.getItem("lastKicked");
        if (lastKickedTime && Date.now() - parseInt(lastKickedTime) < KICK_BAN_TIME) {
            setError(`You were kicked before! Please wait ${kickCountdown} seconds before rejoining.`);
            return;
        }

        try {
            const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
            const snapshot = await get(lobbyRef);

            if (snapshot.exists()) {
                const playerRef = push(ref(db, `lobbies/${lobbyCode}/players`));
                const playerId = playerRef.key || "";

                await set(playerRef, {
                    name: playerName,
                    isHost: false,
                });

                localStorage.setItem("playerId", playerId);
                localStorage.setItem("playerName", playerName);
                localStorage.removeItem("lastKicked"); // Allow them to join again

                router.push(`/lobby/${lobbyCode}`);
            } else {
                setError("Lobby does not exist!");
            }
        } catch (err) {
            setError("Error checking lobby.");
        }
    };
    
    const cleanupEmptyLobbies = async () => {
        try {
            const lobbiesRef = ref(db, "lobbies");
            const snapshot = await get(lobbiesRef);
            
            if(snapshot.exists()){
                const lobbies = snapshot.val();
                for (const lobbyCode in lobbies){
                    const players = lobbies[lobbyCode].players;
                    if(!players || Object.keys(players).length === 0){
                        await set(ref(db, `lobbies/${lobbyCode}`), null);
                        console.log(`Deleted empty lobby: ${lobbyCode}`);
                    }
                }
            }
        } catch (error){
            console.error("Error cleaning up empty lobbies:", error);
        }
    }

    const createLobby = async () => {
        if (!playerName.trim()) {
            setError("Please enter your name.");
            return;
        }

        const lastCreatedLobbyTime = localStorage.getItem("lastLobbyCreated");
        const currentTime = Date.now();

        if (lastCreatedLobbyTime && currentTime - parseInt(lastCreatedLobbyTime) < RATE_LIMIT_TIME) {
            return;
        }

        localStorage.setItem("lastLobbyCreated", currentTime.toString());

        let customCode = lobbyCode.trim(); // Use user input if provided

        if (!/^[a-zA-Z0-9]{5,10}$/.test(customCode)) {
            let uniqueCode = "";
            let attempts = 0;

            while (attempts < 5) {
                const newLobbyRef = push(ref(db, "lobbies"));
                uniqueCode = (newLobbyRef.key ?? "ABCDE").substring(0, 8).toUpperCase();

                const lobbyExists = (await get(ref(db, `lobbies/${uniqueCode}`))).exists();
                if (!lobbyExists) {
                    customCode = uniqueCode;
                    break;
                }

                attempts++;
            }
        }

        try {
            const lobbyRef = ref(db, `lobbies/${customCode}`);
            const lobbySnapshot = await get(lobbyRef);

            if (lobbySnapshot.exists()) {
                setError("A lobby with this code already exists.");
                return;
            }

            const playerRef = push(ref(db, `lobbies/${customCode}/players`));
            const playerId = playerRef.key ?? "";

            await set(ref(db, `lobbies/${customCode}`), {
                players: {
                    [playerId]: {
                        name: playerName,
                        isHost: true,
                    },
                },
                gameState: "waiting",
            });

            localStorage.setItem("playerId", playerId);
            localStorage.setItem("playerName", playerName);

            router.push(`/lobby/${customCode}`);
        } catch (err) {
            setError("Error creating lobby.");
        }
    };


    return (
        <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
            <div className="flex flex-col items-center">
                <img src="/articcone-logo.png" alt="Artic Cone Logo" className="w-full max-w-[500px] h-auto mb-4" />
                <h1 className="text-4xl font-bold text-primary">ARTIC CONE</h1>
            </div>
            

            <div className="mt-8 flex flex-col items-center space-y-4">
                <Input
                    type="text"
                    placeholder="Enter Your Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={10}
                    className="text-center"
                />
                <Input
                    type="text"
                    placeholder="Enter Lobby Code"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    maxLength={10}
                    className="text-center"
                />

                <div className="h-6 flex items-center">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>

                {countdown !== null && (
                    <p className="text-yellow-500 text-sm">You must wait {countdown} seconds before creating another lobby.</p>
                )}

                {kickCountdown !== null && (
                    <p className="text-red-500 text-sm">You were kicked before! Please wait {kickCountdown} seconds before rejoining.</p>
                )}

                <div className="flex space-x-4">
                    <Button variant="default" onClick={checkAndJoinLobby}>
                        Join Lobby
                    </Button>
                    <Button variant="secondary" onClick={createLobby} disabled={countdown !== null}>
                        Create Lobby
                    </Button>
                </div>
            </div>
        </main>
    );
}
