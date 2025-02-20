"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { ref, get, set, push } from "firebase/database";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // WebSocket Server

export default function Home() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Artic Cone Home";

        const savedLobby = localStorage.getItem("lobbyCode");
        const savedPlayer = localStorage.getItem("playerId");

        // Check if the lobby exists before redirecting
        const verifyLobby = async () => {
            if (savedLobby && savedPlayer) {
                const lobbyRef = ref(db, `lobbies/${savedLobby}`);
                const snapshot = await get(lobbyRef);

                if (snapshot.exists()) {
                    toast.success("Rejoining your lobby...");
                    router.push(`/lobby/${savedLobby}`);
                } else {
                    // If lobby doesn't exist, clear session storage
                    localStorage.removeItem("lobbyCode");
                    localStorage.removeItem("playerId");
                    localStorage.removeItem("playerName");
                    toast.error("Your lobby no longer exists.");
                }
            }
        };

        verifyLobby();

        // Listen for storage changes (other tabs)
        const syncTabs = (event: StorageEvent) => {
            if (event.key === "lobbyCode" || event.key === "playerId") {
                window.location.reload(); // Force sync
            }
        };

        window.addEventListener("storage", syncTabs);

        return () => {
            window.removeEventListener("storage", syncTabs);
        };
    }, [router]);

    // Function to generate a clean, readable lobby code
    const generateLobbyCode = (length = 6) => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    };

    const checkAndJoinLobby = async () => {
        if (!playerName.trim() || !lobbyCode.trim()) {
            setError("Please enter a lobby code and your name.");
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

                // Save session locally
                localStorage.setItem("playerId", playerId);
                localStorage.setItem("playerName", playerName);
                localStorage.setItem("lobbyCode", lobbyCode);

                // Trigger storage event for other tabs
                localStorage.setItem("syncUpdate", Date.now().toString());

                // Emit WebSocket event to notify others
                socket.emit("join_lobby", { code: lobbyCode, playerId, playerName });

                router.push(`/lobby/${lobbyCode}`);
            } else {
                setError("Lobby does not exist!");
            }
        } catch (err) {
            setError("Error checking lobby.");
        }
    };

    const createLobby = async () => {
        if (!playerName.trim()) {
            setError("Please enter your name.");
            return;
        }

        let customCode = lobbyCode.trim() || generateLobbyCode(); // Allow custom or auto-generate

        try {
            const lobbyRef = ref(db, `lobbies/${customCode}`);
            const lobbySnapshot = await get(lobbyRef);

            if (lobbySnapshot.exists()) {
                setError("A lobby with this code already exists. Try again.");
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

            // Save session locally
            localStorage.setItem("playerId", playerId);
            localStorage.setItem("playerName", playerName);
            localStorage.setItem("lobbyCode", customCode);

            //  Trigger storage event for other tabs
            localStorage.setItem("syncUpdate", Date.now().toString());

            // Notify other players via WebSockets
            socket.emit("create_lobby", { code: customCode, hostId: playerId, hostName: playerName });

            setLobbyCode(customCode);
            toast.success(`Lobby Created: ${customCode}`);

            router.push(`/lobby/${customCode}`);
        } catch (err) {
            setError("Error creating lobby.");
        }
    };

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            <div className="flex flex-col items-center">
                <img src="/articcone-logo.png" alt="Artic Cone Logo" className="w-full max-w-[500px] h-auto mb-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                    ARTIC CONE
                </h1>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-4">
                <Input
                    type="text"
                    placeholder="Enter Your Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                    className="text-center bg-gradient-to-b from-white to-blue-100 shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-400 text-amber-950"
                />
                <Input
                    type="text"
                    placeholder="Enter Lobby Code"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="text-center bg-gradient-to-b from-white to-blue-100 shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-400 text-amber-950"
                />

                <div className="h-6 flex items-center">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>

                <div className="flex space-x-4">
                    <Button
                        variant="default"
                        onClick={checkAndJoinLobby}
                        className="bg-gradient-to-b from-white to-blue-100 hover:from-blue-100 hover:to-white shadow-md border border-gray-300 text-amber-950"
                    >
                        Join Lobby
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={createLobby}
                        className="bg-gradient-to-b from-white to-blue-100 hover:from-blue-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                    >
                        Create Lobby
                    </Button>
                </div>
            </div>
        </main>
    );
}
