"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, remove, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Suspense } from "react";


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
                const playerList: Player[] = Object.entries(data).map(([id, player]: [string, any]) => ({
                    id,
                    ...player,
                }));

                setPlayers(playerList);
                if (savedId) setIsHost(data[savedId]?.isHost || false);

                // If the current player is removed, show a message and redirect
                if (savedId && !data[savedId]) {
                    toast.error("You have been removed from the lobby.");
                    router.push("/");
                }

                // If only 1 player remains, start a delete timer
                if (playerList.length === 1) {
                    setShowDeleteWarning(true);
                    if (!lobbyDeleteTimeout.current) {
                        lobbyDeleteTimeout.current = setTimeout(() => deleteLobby(), 120000); // 2 minutes
                    }
                } else {
                    setShowDeleteWarning(false);
                    if (lobbyDeleteTimeout.current) {
                        clearTimeout(lobbyDeleteTimeout.current);
                        lobbyDeleteTimeout.current = null;
                    }
                }
            } else {
                // No players exist, delete the lobby immediately
                toast.error("Lobby has been deleted due to inactivity.");
                await remove(ref(db, `lobbies/${code}`));
                router.push("/");
            }
        });

        document.title = "Artic Cone Lobby - " + code;

        return () => unsubscribe();
    }, [code, router]);


    //  Assign a new host when the host leaves
    const assignNewHost = async () => {
        if (players.length <= 1) return;

        // Find the current host
        const currentHost = players.find((player) => player.isHost);
        const nonHostPlayers = players.filter((player) => !player.isHost);
        if (nonHostPlayers.length == 0) return;

        // Select a new host randomly
        const newHost = nonHostPlayers[Math.floor(Math.random() * nonHostPlayers.length)];

        const updates: Record<string, any> = {};

        // Remove host role from the previous host
        if (currentHost) {
            updates[`lobbies/${code}/players/${currentHost.id}/isHost`] = false;
        }

        // Assign host role to the new host
        updates[`lobbies/${code}/players/${newHost.id}/isHost`] = true;

        // Update Firebase
        await update(ref(db), updates);

        // Manually update state to trigger UI change
        setPlayers((prevPlayers) =>
            prevPlayers.map((player) => ({
                ...player,
                isHost: player.id === newHost.id, // Only new host should have isHost: true
            }))
        );

        // Update the local `isHost` state for the current user
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
            console.log(`🗑️ Lobby ${code} is now empty. Deleting...`);
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
        <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
            {code ? (
                <>
                    <h1 className="text-3xl font-bold text-primary">Lobby Code: {code}</h1>
                    <p className="text-xl">Players in Lobby:</p>

                    <div className="flex flex-col items-center w-full max-w-md space-y-2">
                        {players.map((player) => (
                            <div key={player.id}
                                 className="flex justify-between w-full p-3 border rounded-lg shadow-sm bg-card">
                                <span className="text-lg">{player.name} {player.isHost && "👑"}</span>

                                {isHost && player.id !== playerId && (
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="destructive"
                                                onClick={() => remove(ref(db, `lobbies/${code}/players/${player.id}`))}>
                                            Kick
                                        </Button>
                                        <Button size="sm" variant="outline"
                                                onClick={() => update(ref(db, `lobbies/${code}/players/${player.id}`), {isHost: true})}>
                                            Make Host
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {showDeleteWarning && (
                        <p className="text-red-500 mt-2 text-center">
                            This lobby will be deleted in 2 minutes if no one joins.
                        </p>
                    )}

                    {isHost && (
                        <div className="mt-4 flex flex-col items-center space-y-3">
                            <Button variant="default" className="w-40" onClick={startGame}>
                                Start Game
                            </Button>

                            <Button variant="destructive" className="w-40" onClick={deleteLobby}>
                                Delete Lobby
                            </Button>
                        </div>
                    )}

                    <Button variant="secondary" className="mt-4 w-40" onClick={handleTabClose}>
                        Leave Lobby
                    </Button>
                </>
            ) : (
                <p className="text-lg text-red-500">Loading lobby...</p>
            )}
        </main>
    );
}
