"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import LobbyHeader from "@/components/LobbyHeader";
import PlayerList from "@/components/PlayerList";
import LobbyCountdown from "@/components/LobbyCountdown";
import LobbyControls from "@/components/LobbyControls";
import useLobby from "@/hooks/useLobby";
import "@/app/styles/globals.css";
import {leaveLobby} from "@/lib/lobbyService";

export default function LobbyPage() {
    const params = useParams();
    const router = useRouter();
    const [code, setCode] = useState<string | null>(null);

    useEffect(() => {
        if (typeof params.code === "string") {
            setCode(params.code);
        }
    }, [params]);

    const { players, isHost, countdown, kickPlayer, makeHost, resetDeletionTimer } = useLobby(code);

    const handleDeleteLobby = async () => {
        if (!code) return;
        await remove(ref(db, `lobbies/${code}`));
        toast.error("Lobby deleted.");
        router.push("/");
    };

    const handleStartGame = () => {
        router.push(`/gamePage/${code}`);
    };

    const handleLeaveLobby = () => {
        router.push("/");
        leaveLobby(code!);
    };



    // Use a ref to store the previous number of players
    const prevPlayersCount = useRef<number>(players.length);

    // Reset the deletion timer only if a new player joins (and you're the host)
    useEffect(() => {
        if (isHost && players.length > prevPlayersCount.current) {
            resetDeletionTimer();
        }
        prevPlayersCount.current = players.length;
    }, [players, isHost, resetDeletionTimer]);

    const savedId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            {code ? (
                <>
                    <LobbyHeader code={code} />
                    <p className="text-xl font-semibold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                        Players in Lobby:
                    </p>
                    <PlayerList
                        players={players}
                        currentPlayerId={savedId}
                        isHost={isHost}
                        onKick={kickPlayer}
                        onMakeHost={makeHost}
                    />
                    {/* Render the countdown only if there's one or fewer players */}
                    {players.length <= 1 && countdown !== null && (
                        <LobbyCountdown countdown={countdown} />
                    )}
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
