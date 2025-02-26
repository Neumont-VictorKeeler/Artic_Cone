"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import socket from "@/lib/socket";
import Whiteboard from "./pageComponents/gameCanvas";
import GamePrompt from "./pageComponents/gamePrompt";
import EndScreen from "@/components/Endscreen";

function getChainOwnerIndex(myIndex: number, round: number, totalPlayers: number) {
    return ((myIndex - (round - 1)) % totalPlayers + totalPlayers) % totalPlayers;
}

function convertTimestampToSeconds(timestamp: number) {
    const now = Date.now();
    return Math.max(0, Math.floor((timestamp - now) / 1000));
}

interface ChainEntry {
    prompt?: string;
    image?: string;
}

interface Player {
    id: string;
    locked: boolean;
    name?: string;
}

interface Game {
    phase: "drawing" | "guessing" | "complete";
    round: number;
    totalRounds: number;
    timer: number;
    lockedCount: number;
    players: Player[];
    results: Record<string, { chain: ChainEntry[] }>;
}

export default function GamePage() {
    const router = useRouter();
    const { code } = useParams();

    const [game, setGame] = useState<Game | null>(null);
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMyPlayerId(localStorage.getItem("playerId") || null);
    }, []);

    useEffect(() => {
        if (!code) return;
        const gameRef = ref(db, `lobbies/${code}/game`);
        const unsub = onValue(gameRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast.error("Game not found or deleted.");
                router.push("/");
                return;
            }
            const data = snapshot.val() as Game;
            setGame(data);
            setIsLoading(false);

            if (data.phase === "complete") {
                router.push(`/gameResults/${code}`);
            }
        });
        return () => unsub();
    }, [code, router]);

    useEffect(() => {
        if (!game || !myPlayerId) return;
        const inGame = game.players.some((p) => p.id === myPlayerId);
        if (!inGame) {
            toast.error("You are not in this game.");
            router.push("/");
        }
    }, [game, myPlayerId, router]);

    if (isLoading || !game) {
        return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
    }

    // Determine my index in the players array.
    let myIndex = -1;
    if (game.players && myPlayerId) {
        myIndex = game.players.findIndex((p) => p.id === myPlayerId);
    }

    let chainOwnerId: string | null = null;
    let lastEntry: ChainEntry | null = null;
    if (game && myIndex !== -1) {
        const chainOwnerIndex = getChainOwnerIndex(myIndex, game.round, game.players.length);
        chainOwnerId = game.players[chainOwnerIndex].id;
        const chainKey = `player_${chainOwnerId}`;
        const chainData = game.results?.[chainKey]?.chain || [];
        lastEntry = chainData.length > 0 ? chainData[chainData.length - 1] : null;
    }

    const lastPrompt = lastEntry?.prompt || "";
    const lastImage = lastEntry?.image || "";

    const handleDrawingSubmission = async (imageData: string) => {
        if (!game || myIndex === -1 || !chainOwnerId) return;

        const updatedPlayers = game.players.map((p) =>
            p.id === myPlayerId ? { ...p, locked: true } : p
        );
        const lockedCount = updatedPlayers.filter((p) => p.locked).length;

        const chainKey = `player_${chainOwnerId}`;
        const chainData = game.results[chainKey]?.chain || [];
        // In drawing phase, add a new entry with the drawing.
        chainData.push({ image: imageData });

        await update(ref(db, `lobbies/${code}/game/results/${chainKey}`), {
            chain: chainData,
        });

        await update(ref(db, `lobbies/${code}/game`), {
            players: updatedPlayers,
            lockedCount,
        });

        if (lockedCount === game.players.length) {
            handleRoundComplete();
        }
    };

    const handlePromptSubmission = async (promptValue: string) => {
        if (!game || myIndex === -1 || !chainOwnerId) return;

        const updatedPlayers = game.players.map((p) =>
            p.id === myPlayerId ? { ...p, locked: true } : p
        );
        const lockedCount = updatedPlayers.filter((p) => p.locked).length;

        const chainKey = `player_${chainOwnerId}`;
        const chainData = game.results[chainKey]?.chain || [];
        // In guessing phase, add a new entry with the prompt.
        chainData.push({ prompt: promptValue });

        await update(ref(db, `lobbies/${code}/game/results/${chainKey}`), {
            chain: chainData,
        });

        await update(ref(db, `lobbies/${code}/game`), {
            players: updatedPlayers,
            lockedCount,
        });

        if (lockedCount === game.players.length) {
            handleRoundComplete();
        }
    };

    const handleRoundComplete = async () => {
        if (!game) return;
        const { round, totalRounds } = game;

        // Always increment the round
        const nextRound = round + 1;

        // Determine phase based on round parity:
        // - Odd rounds: drawing phase
        // - Even rounds: guessing phase
        const nextPhase = nextRound % 2 === 1 ? "drawing" : "guessing";

        // If we've exceeded totalRounds, the game is complete.
        if (nextRound > totalRounds) {
            await update(ref(db, `lobbies/${code}/game`), {
                phase: "complete",
            });
            router.push(`/gameResults/${code}`);
            return;
        }

        // Unlock all players
        const updatedPlayers = game.players.map((p) => ({ ...p, locked: false }));

        // Update game node with new round, phase, timer, and reset lockedCount.
        await update(ref(db, `lobbies/${code}/game`), {
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers,
            lockedCount: 0,
            timer: Date.now() + 60000,
        });

        socket.emit("update_game_state", {
            code,
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers,
        });
    };


    const timeLeftInSeconds = convertTimestampToSeconds(game.timer);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            <h1 className="text-xl font-semibold">Round {game.round} / {game.totalRounds}</h1>
            <h1 className="text-xl font-semibold">Phase: {game.phase.toUpperCase()}</h1>

            {game.phase === "drawing" && (
                <Whiteboard
                    timer={timeLeftInSeconds}
                    prompt={lastPrompt} // Display the prompt from the chain's last entry
                    isLocked={game.players.find((p) => p.id === myPlayerId)?.locked || false}
                    onLock={handleDrawingSubmission}
                />
            )}
            {game.phase === "guessing" && (
                <GamePrompt
                    timer={timeLeftInSeconds}
                    onComplete={handlePromptSubmission}
                    image={lastImage} // Display the image from the chain's last entry
                />
            )}
        </main>
    );
}
