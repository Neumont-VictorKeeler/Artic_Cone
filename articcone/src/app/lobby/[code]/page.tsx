"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { ref, update, get, remove, onValue } from "firebase/database";
import socket from "@/lib/socket";
import useLobby from "@/hooks/useLobby";
import LobbyHeader from "@/components/LobbyHeader";
import PlayerList from "@/components/PlayerList";
import LobbyControls from "@/components/LobbyControls";
import LobbyCountdown from "@/components/LobbyCountdown";
import useGameStart from "@/hooks/useGameStart";
import {initializeGame} from "@/hooks/gameUtils";

interface PlayerResults {
    [key: string]: {
        image: string;
        prompt: string;
    };
}

interface Players {
    [key: string]: {
        id: string;
        locked: boolean;
        // Other lobby info like isHost and name
        isHost?: boolean;
        name?: string;
    };
}

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

    // If gameState is already started, go to game page.
    useEffect(() => {
        if (!code) return;
        const lobbyRef = ref(db, `lobbies/${code}`);
        onValue(lobbyRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.gameState === "started") {
                router.push(`/gamePage/${code}`);
            }
        });
    }, [code, router]);

    const { players, isHost, countdown, kickPlayer, makeHost } = useLobby(code);

    const handleDeleteLobby = async () => {
        if (!code) return;
        await remove(ref(db, `lobbies/${code}`));
        toast.error("Lobby deleted.");
        router.push("/");
    };

    const handleStartGame = async () => {
        if (!code) return;

        try {
            await initializeGame(code, players);
            router.push(`/gamePage/${code}`);
        } catch (error) {
            toast.error("Failed to start the game: " + error.message);
        }
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

    useGameStart();

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
