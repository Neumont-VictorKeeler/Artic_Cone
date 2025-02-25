"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import {ref, update, get, remove, onValue} from "firebase/database";
import socket from "@/lib/socket";
import useLobby from "@/hooks/useLobby";
import useGameStart from "@/hooks/useGameStart";
import LobbyHeader from "@/components/LobbyHeader";
import PlayerList from "@/components/PlayerList";
import LobbyControls from "@/components/LobbyControls";
import LobbyCountdown from "@/components/LobbyCountdown";

export default function LobbyPage() {
    const params = useParams();
    const router = useRouter();
    const [code, setCode] = useState<string | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof params.code === "string") {
            setCode(params.code);
        }
    }, [params]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSavedId(localStorage.getItem("playerId"));
        }
    }, []);

    useEffect(() => {
        if (!code) return;
        const lobbyRef = ref(db, `lobbies/${code}`);
        onValue(lobbyRef, (snapshot) => {
            const data = snapshot.val();
            if (data.gameState === "started") {
                router.push(`/gamePage/${code}`);
            }
        });
    }, [code, router]);


    const { players, isHost, countdown, kickPlayer, makeHost, resetDeletionTimer } = useLobby(code);

    const handleDeleteLobby = async () => {
        if (!code) return;
        await remove(ref(db, `lobbies/${code}`));
        toast.error("Lobby deleted.");
        router.push("/");
    };


    const handleStartGame = async () => {
        if (!code) return;

        // 1. Fetch random prompts from the database
        const promptsRef = ref(db, "prompts");
        const snapshot = await get(promptsRef);
        const prompts = snapshot.val();

        // 2. Check if prompts are available
        if (!prompts) {
            toast.error("No prompts available in the database.");
            return;
        }

        const promptList = Object.values(prompts);
        // Shuffle them
        const shuffledPrompts = promptList.sort(() => 0.5 - Math.random());

        // 3. Assign each player an initial prompt
        const playerPrompts = players.map((player, index) => ({
            ...player,
            prompt: shuffledPrompts[index % shuffledPrompts.length],
        }));

        // 4. Build the initial "game" node
        const totalRounds = players.length;
        await update(ref(db, `lobbies/${code}`), {
            game: {
                round: 1,
                totalRounds,
                phase: "drawing",
                players: playerPrompts,
                results: {},
                timer: Date.now() + 60000 // <--- 1 minute from now
            },
            gameState: "started",
        });

        socket.emit("start_game", { code });
        router.push(`/gamePage/${code}`);
    };

    const handleLeaveLobby = async () => {
        if (!code || !savedId) return;
        await remove(ref(db, `lobbies/${code}/players/${savedId}`));
        localStorage.removeItem("lobbyCode");
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
        toast.success("You have left the lobby.");
        router.push("/");
    };

    useGameStart(); // listens for "start_game" socket event

    // ...the rest of your Lobby UI code (rendering players, host controls, etc.)...
    // e.g., your <LobbyHeader>, <PlayerList>, etc.


    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            {code ? (
                <>
                    <LobbyHeader code={code} />
                    <p className="text-xl font-semibold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                        Players in Lobby: {players.length}
                    </p>
                    <PlayerList
                        players={players}
                        currentPlayerId={savedId}
                        isHost={isHost}
                        onKick={kickPlayer}
                        onMakeHost={makeHost}
                    />
                    {countdown !== null && players.length <= 1 && <LobbyCountdown countdown={countdown} />}
                    <LobbyControls
                        isHost={isHost}
                        onStartGame={handleStartGame}
                        onDeleteLobby={handleDeleteLobby}
                        onLeaveLobby={handleLeaveLobby} 
                    />
                </>
            ) : (
                <p className="text-lg text-red-500">Loading lobby...</p>
            )}
        </main>
    );
}