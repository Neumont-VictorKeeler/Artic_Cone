"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, remove, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import "@/app/styles/globals.css";

interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

//TODO: Add game settings for host to customize
//TODO: Deploy both client and server to Vercel
//TODO: ensure host disconnect reassigns host to another player
//TODO: add player limit to lobby? (5 players for presentation)
//TODO: split lobby page into components for better readability, different files for different components.

// WebSocket Connection
const socket = io("http://localhost:3001"); //TODO: change to server URL

export default function Lobby() {
    const router = useRouter();
    const params = useParams();
    const [code, setCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string>("");
    const [deletionTimestamp, setDeletionTimestamp] = useState<number | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Extract `params.code`
    useEffect(() => {
        if (typeof params.code === "string") {
            setCode(params.code);
        }
    }, [params]);

    useEffect(() => {
        if (!code) return;

        const savedId = localStorage.getItem("playerId");
        const savedName = localStorage.getItem("playerName");

        if (!savedId || !savedName) {
            toast.error("You must join the lobby from the homepage.");
            router.push("/");
            return;
        }

        setPlayerId(savedId);
        setPlayerName(savedName);

        const lobbyRef = ref(db, `lobbies/${code}`);

        const unsubscribe = onValue(lobbyRef, async (snapshot) => {
            const data = snapshot.val();

            if (data) {
                // Sync players
                const playerList: Player[] = data.players
                    ? Object.entries(data.players).map(([id, player]: [string, any]) => ({
                        id,
                        ...player,
                    }))
                    : [];

                setPlayers(playerList);
                setIsHost(data.players?.[savedId]?.isHost || false);

                // If player was removed, redirect
                if (savedId && !data.players?.[savedId]) {
                    toast.error("You have been removed from the lobby.");
                    router.push("/");
                }

                // Sync deletion timestamp from Firebase
                if (data.deletionTimestamp) {
                    setDeletionTimestamp(data.deletionTimestamp);
                } else if (playerList.length === 1 && playerList[0].isHost) {
                    // If only host remains, set a new deletion timestamp
                    const newDeletionTimestamp = Date.now() + 120000; // 120 seconds from now
                    await update(ref(db, `lobbies/${code}`), { deletionTimestamp: newDeletionTimestamp });
                    setDeletionTimestamp(newDeletionTimestamp);
                    socket.emit("update_timer", newDeletionTimestamp);
                } else {
                    setDeletionTimestamp(null);
                }
            } else {
                toast.error("Lobby deleted due to inactivity.");
                router.push("/");
            }
        });

        // WebSocket: Sync deletion timer across all clients
        socket.on("update_timer", (newTimestamp: number) => {
            setDeletionTimestamp(newTimestamp);
        });

        return () => {
            unsubscribe();
            socket.off("update_timer");
        };
    }, [code, router]);

    // Update countdown dynamically
    useEffect(() => {
        if (!deletionTimestamp) return;

        const interval = setInterval(() => {
            const remainingTime = Math.floor((deletionTimestamp - Date.now()) / 1000);
            setCountdown(remainingTime > 0 ? remainingTime : 0);

            // If the countdown reaches zero, auto-delete the lobby
            if (remainingTime <= 0) {
                remove(ref(db, `lobbies/${code}`));
                toast.error("Lobby deleted due to inactivity.");
                router.push("/");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [deletionTimestamp, code, router]);

    // Reset timer when a player joins
    const resetDeletionTimer = async () => {
        if (!isHost || !code) return;

        const newTimestamp = Date.now() + 120000;
        await update(ref(db, `lobbies/${code}`), { deletionTimestamp: newTimestamp });
        socket.emit("update_timer", newTimestamp);
    };

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            {code ? (
                <>
                    {/* Lobby Header */}
                    <div
                        className="relative group cursor-pointer mt-4 p-2 border-2 border-transparent rounded-lg hover:border-blue-500 hover:bg-blue-200 transition duration-200"
                        onClick={() => {
                            if (code) {
                                navigator.clipboard.writeText(code);
                                toast.success("Code copied to clipboard!");
                            }
                        }}
                    >
                        <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                            Lobby Code: {code}
                        </h1>

                        {/* Copy Tooltip - Visible on Hover */}
                        <span
                            className="absolute left-1/2 bottom-[-30px] transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm shadow-lg"
                        >
                            Click to copy code!
                        </span>
                    </div>

                    {/* Styled Paragraph to Match Title */}
                    <p className="text-xl font-semibold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                        Players in Lobby:
                    </p>

                    {/* Player List Container */}
                    <div className="flex flex-col items-center w-full max-w-md space-y-2">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="flex justify-between w-full p-3 border rounded-lg shadow-md bg-gradient-to-b from-white to-blue-100 text-amber-950 text-lg"
                            >
                                <span>{player.name} {player.isHost && "👑"}</span>
                            </div>
                        ))}
                    </div>

                    {/* Lobby Deletion Countdown */}
                    {deletionTimestamp && countdown !== null && (
                        <p className="text-red-500 mt-2 text-center">
                            Lobby will be deleted in <span className="font-bold">{countdown} seconds</span> unless someone joins.
                        </p>
                    )}

                    {/* Buttons Section - Evenly Spaced */}
                    <div className="mt-6 flex flex-col items-center space-y-4 w-full max-w-xs">
                        {/* Start Game - Green Tint */}
                        {isHost && (
                            <Button
                                variant="default"
                                className="bg-gradient-to-b from-white to-blue-100 hover:from-green-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                                onClick={() => router.push(`/gamePage/`)}
                            >
                                Start Game
                            </Button>
                        )}

                        {/* Delete Lobby - Red Tint */}
                        {isHost && (
                            <Button
                                variant="destructive"
                                className="bg-gradient-to-b from-white to-blue-100 hover:from-red-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                                onClick={() => remove(ref(db, `lobbies/${code}`))}
                            >
                                Delete Lobby
                            </Button>
                        )}
                        
                    </div>
                </>
            ) : (
                <p className="text-lg text-red-500">Loading lobby...</p>
            )}
        </main>
    );
}
