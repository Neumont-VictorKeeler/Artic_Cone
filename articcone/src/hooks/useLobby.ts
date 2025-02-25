"use client";

import { useState, useEffect, useCallback } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

function useLobby(code: string | null) {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [deletionTimestamp, setDeletionTimestamp] = useState<number | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (!code) return;

        const savedId = localStorage.getItem("playerId");
        const savedName = localStorage.getItem("playerName");

        if (!savedId || !savedName) {
            toast.error("You must join the lobby from the homepage.");
            router.push("/");
            return;
        }

        const lobbyRef = ref(db, `lobbies/${code}`);

        const unsubscribe = onValue(lobbyRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const playerList: Player[] = data.players
                    ? Object.entries(data.players).map(([id, player]) => ({
                        id,
                        ...(player as { name: string; isHost: boolean }),
                    }))
                    : [];

                setPlayers(playerList);
                setIsHost(data.players?.[savedId]?.isHost || false);

                // If the current player's record is missing, they've been kicked.
                if (savedId && !data.players?.[savedId]) {
                    localStorage.removeItem("lobbyCode");
                    localStorage.removeItem("playerId");
                    localStorage.removeItem("playerName");
                    localStorage.setItem("kicked", "true");
                    toast.error("You have been removed from the lobby.");
                    router.push("/");
                }

                // Modified deletion timer logic:
                if (playerList.length > 1) {
                    // More than one player: clear the deletion timer.
                    setDeletionTimestamp(null);
                } else if (playerList.length === 1 && playerList[0].isHost) {
                    // Only the host remains: start or update the deletion countdown.
                    const newDeletionTimestamp = Date.now() + 120000; // 120 seconds from now
                    await update(ref(db, `lobbies/${code}`), { deletionTimestamp: newDeletionTimestamp });
                    setDeletionTimestamp(newDeletionTimestamp);
                    socket.emit("update_timer", newDeletionTimestamp);
                } else {
                    // Fallback: clear deletion timer.
                    setDeletionTimestamp(null);
                }
            } else {
                toast.error("Lobby deleted due to inactivity.");
                router.push("/");
            }
        });

        socket.on("update_timer", (newTimestamp: number) => {
            setDeletionTimestamp(newTimestamp);
        });

        return () => {
            unsubscribe();
            socket.off("update_timer");
        };
    }, [code, router]);

    // Countdown effect: if deletionTimestamp is null, clear countdown.
    useEffect(() => {
        if (!deletionTimestamp) {
            setCountdown(null);
            return;
        }

        const interval = setInterval(() => {
            const remainingTime = Math.floor((deletionTimestamp - Date.now()) / 1000);
            setCountdown(remainingTime > 0 ? remainingTime : 0);
            if (remainingTime <= 0) {
                remove(ref(db, `lobbies/${code}`));
                toast.error("Lobby deleted due to inactivity.");
                router.push("/");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [deletionTimestamp, code, router]);

    const kickPlayer = useCallback(
        async (id: string) => {
            if (!code) return;
            if (id === localStorage.getItem("playerId")) {
                toast.error("You cannot kick yourself!");
                return;
            }
            await remove(ref(db, `lobbies/${code}/players/${id}`));
            toast.success("Player kicked!");
        },
        [code]
    );

    const makeHost = useCallback(
        async (newHostId: string) => {
            if (!code) return;
            const savedId = localStorage.getItem("playerId");
            if (!isHost) {
                toast.error("Only the current host can reassign host status.");
                return;
            }
            if (newHostId === savedId) {
                toast.error("You are already the host!");
                return;
            }
            await update(ref(db, `lobbies/${code}`), {
                [`players/${savedId}/isHost`]: false,
                [`players/${newHostId}/isHost`]: true,
            });
            toast.success("Host changed successfully!");
        },
        [code, isHost]
    );

    const resetDeletionTimer = useCallback(async () => {
        if (!isHost || !code) return;
        const newTimestamp = Date.now() + 120000;
        await update(ref(db, `lobbies/${code}`), { deletionTimestamp: newTimestamp });
        socket.emit("update_timer", newTimestamp);
    }, [isHost, code]);

    return { players, isHost, countdown, kickPlayer, makeHost, resetDeletionTimer };
}

export default useLobby;