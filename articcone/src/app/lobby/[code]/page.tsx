"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, remove, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import "@/app/styles/globals.css";


interface Player {
    id: string;
    name: string;
    isHost: boolean;
}


export default function Lobby() {
    const router = useRouter();
    const params = useParams();
    const [code, setCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string>("");
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const tabCloseTimeout = useRef<NodeJS.Timeout | null>(null);
    const lobbyDeleteTimeout = useRef<NodeJS.Timeout | null>(null);

    //  Extract `params.code`
    useEffect(() => {
        if (typeof params.code === "string") {
            setCode(params.code);
        }
    }, [params]);

    //  Fetch Lobby Data
    const [countdown, setCountdown] = useState<number | null>(null); // Store countdown timer in state

    useEffect(() => {
        if (!code) return;

        const savedId = localStorage.getItem("playerId");
        const savedName = localStorage.getItem("playerName");

        if (savedId) setPlayerId(savedId);
        if (savedName) setPlayerName(savedName);

        const lobbyRef = ref(db, `lobbies/${code}/players`);
        const unsubscribe = onValue(lobbyRef, async (snapshot) => {
            const data = snapshot.val();

            if (data) {
                // Convert Firebase data into a valid player list
                const playerList: Player[] = Object.entries(data)
                    .map(([id, player]: [string, any]) => ({
                        id,
                        ...player,
                    }))
                    .filter((player) => player.id && player.name); // Remove ghost players

                setPlayers(playerList);
                if (savedId) setIsHost(data[savedId]?.isHost || false);

                // If the current player is removed, redirect them
                if (savedId && !data[savedId]) {
                    toast.error("You have been removed from the lobby.");
                    router.push("/");
                }

                // 🚨 Remove any ghost players from Firebase
                for (const key of Object.keys(data)) {
                    if (!data[key].name) {
                        await remove(ref(db, `lobbies/${code}/players/${key}`));
                    }
                }

                //  If only 1 player (the host) remains, start countdown
                if (playerList.length === 1 && playerList[0].isHost) {
                    setShowDeleteWarning(true);
                    setCountdown(120); // Start countdown at 120 seconds

                    if (!lobbyDeleteTimeout.current) {
                        lobbyDeleteTimeout.current = setInterval(async () => {
                            setCountdown((prev) => {
                                if (prev === null) return null;
                                if (prev <= 1) {
                                    console.log(`🗑️ Lobby ${code} is empty. Deleting...`);
                                    remove(ref(db, `lobbies/${code}`));
                                    toast.error("Lobby has been deleted due to inactivity.");
                                    clearInterval(lobbyDeleteTimeout.current!);
                                    lobbyDeleteTimeout.current = null;
                                    router.push("/");
                                    return 0;
                                }
                                return prev - 1; // Decrease countdown
                            });
                        }, 1000);
                    }
                } else {
                    // Cancel countdown if a new player joins
                    setShowDeleteWarning(false);
                    setCountdown(null); // Reset countdown
                    if (lobbyDeleteTimeout.current) {
                        clearInterval(lobbyDeleteTimeout.current);
                        lobbyDeleteTimeout.current = null;
                    }
                }
            } else {
                // 🚨 No players exist, delete lobby immediately
                toast.error("Lobby has been deleted due to inactivity.");
                await remove(ref(db, `lobbies/${code}`));
                router.push("/");
            }
        });

        document.title = "Artic Cone Lobby - " + code;

        return () => {
            unsubscribe();
            if (lobbyDeleteTimeout.current) {
                clearInterval(lobbyDeleteTimeout.current);
                lobbyDeleteTimeout.current = null;
            }
        };
    }, [code, router]);




    const updateHost = async (newHostId: string) => {
        if (!isHost || !code) return;

        const updates: Record<string, any> = {};

        // Ensure only one host exists at a time
        players.forEach((player) => {
            updates[`lobbies/${code}/players/${player.id}/isHost`] = player.id === newHostId;
        });

        await update(ref(db), updates);

        // Update local state
        setPlayers((prevPlayers) =>
            prevPlayers.map((player) => ({
                ...player,
                isHost: player.id === newHostId,
            }))
        );

        if (playerId === newHostId) {
            setIsHost(true);
        } else {
            setIsHost(false);
        }

        toast.success(`Host role transferred to ${players.find(p => p.id === newHostId)?.name}!`);
    };


    //  Assign a new host when the host leaves
    const assignNewHost = async () => {
        if (players.length <= 1) return; // If only one player is left, no host change needed.

        // Find the current host
        const currentHost = players.find((player) => player.isHost);
        const nonHostPlayers = players.filter((player) => !player.isHost);

        if (nonHostPlayers.length === 0) return;

        // Pick a new host randomly
        const newHost = nonHostPlayers[Math.floor(Math.random() * nonHostPlayers.length)];

        const updates: Record<string, any> = {};

        // Remove host from previous host
        if (currentHost) {
            updates[`lobbies/${code}/players/${currentHost.id}/isHost`] = false;
        }

        // Assign host to the new host
        updates[`lobbies/${code}/players/${newHost.id}/isHost`] = true;

        // Update Firebase
        await update(ref(db), updates);

        //  Update local state
        setPlayers((prevPlayers) =>
            prevPlayers.map((player) => ({
                ...player,
                isHost: player.id === newHost.id, // Ensure only the new host is marked as host
            }))
        );

        // Update local host state
        if (playerId === currentHost?.id) {
            setIsHost(false);
        } else if (playerId === newHost.id) {
            setIsHost(true);
        }

        toast.success(`${newHost.name} is now the host!`);
    };



    //  Remove player if they close the tab
    const handleTabClose = async () => {
        if (!playerId || !code) return;

        const isLeavingHost = players.find((player) => player.id === playerId)?.isHost;
        await remove(ref(db, `lobbies/${code}/players/${playerId}`));

        // Check if the lobby is empty, and delete it
        const lobbyRef = ref(db, `lobbies/${code}/players`);
        const snapshot = await get(lobbyRef);
        if (!snapshot.exists()) {
            console.log(`🗑Lobby ${code} is now empty. Deleting...`);
            await remove(ref(db, `lobbies/${code}`));
        }

        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");

        if (isLeavingHost) {
            await assignNewHost();
        }
    };


    //  Delete the lobby (only for hosts)
    const deleteLobby = async () => {
        if (!isHost || !code) return;

        await remove(ref(db, `lobbies/${code}`));
        toast.error("Lobby has been deleted.");
        router.push("/");
    };

    //  Detect when the tab loses focus and schedule removal
    const handleVisibilityChange = () => {
        if (!playerId || !code) return;

        if (document.hidden) {
            tabCloseTimeout.current = setTimeout(async () => {
                await remove(ref(db, `lobbies/${code}/players/${playerId}`));
                localStorage.removeItem("playerId");
                localStorage.removeItem("playerName");
                toast.error("You were removed due to inactivity.");
                router.push("/");
            }, 120000); // 2 minutes
        } else {
            if (tabCloseTimeout.current) {
                clearTimeout(tabCloseTimeout.current);
                tabCloseTimeout.current = null;
            }
        }
    };

    const startGame = async () => {
        if (!isHost || !code) return;
        // if (players.length < 1) {
        //     toast.error("Not enough players to start the game.");
        //     return;
        // }

        await update(ref(db, `lobbies/${code}`), { gameState: "started" });

        router.push(`/gamePage/`);
    };


    useEffect(() => {
        window.addEventListener("beforeunload", handleTabClose);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleTabClose);
            document.removeEventListener("visibilitychange", handleVisibilityChange);

            if (tabCloseTimeout.current) clearTimeout(tabCloseTimeout.current);
            if (lobbyDeleteTimeout.current) clearTimeout(lobbyDeleteTimeout.current);
        };
    }, [playerId, code]);
    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            {code ? (
                <>
                    {/* Lobby Header */}
                    <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                        Lobby Code: {code}
                    </h1>

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

                                {isHost && player.id !== playerId && (
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => remove(ref(db, `lobbies/${code}/players/${player.id}`))}
                                        >
                                            Kick
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateHost(player.id)}
                                        >
                                            Make Host
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Lobby Deletion Countdown */}
                    {showDeleteWarning && countdown !== null && (
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
                                onClick={startGame}
                            >
                                Start Game
                            </Button>
                        )}

                        {/* Delete Lobby - Red Tint */}
                        {isHost && (
                            <Button
                                variant="destructive"
                                className="bg-gradient-to-b from-white to-blue-100 hover:from-red-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                                onClick={deleteLobby}
                            >
                                Delete Lobby
                            </Button>
                        )}

                        {/* Leave Lobby - Blue Tint - Evenly Spaced */}
                        <Button
                            variant="secondary"
                            className="bg-gradient-to-b from-white to-blue-100 hover:from-blue-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                            onClick={handleTabClose}
                        >
                            Leave Lobby
                        </Button>
                    </div>
                </>
            ) : (
                <p className="text-lg text-red-500">Loading lobby...</p>
            )}
        </main>
    );
}
