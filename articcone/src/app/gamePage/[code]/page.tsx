"use client";

import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import socket from "@/lib/socket";
import Whiteboard from "./pageComponents/gameCanvas";
import GamePrompt from "./pageComponents/gamePrompt";
import { Player } from "@/hooks/useLobby";
import { Game } from "@/hooks/gameUtils";

function convertTimestampToSeconds(timestamp: number): number {
    const currentTime = Date.now();
    const diffMs = timestamp - currentTime;
    return Math.floor(diffMs / 1000);
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

    // Listen to the game node.
    useEffect(() => {
        if (!code) return;
        const gameRef = ref(db, `lobbies/${code}/game`);
        return onValue(gameRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast.error("Game not found or deleted.");
                router.push("/");
                return;
            }
            const data = snapshot.val();
            setGame(data);
            setIsLoading(false);

            if (data.phase === "complete") {
                router.push(`/gameResults/${code}`);
            }
        });
    }, [code, router]);

    useEffect(() => {
        if (!game || !myPlayerId) return;
        const me = game.players?.find((p) => p.id === myPlayerId);
        if (!me) {
            toast.error("You are not in this game.");
            router.push("/");
        }
    }, [game, myPlayerId, router]);

    // Get the current prompt from results when in drawing phase.
    let currentPrompt = "";
    if (game?.phase === "drawing" && myPlayerId) {
        const roundResults = game.results?.[`player_${myPlayerId}`]?.chain;
        if (roundResults && roundResults[game.round - 1]) {
            currentPrompt = roundResults[game.round - 1].prompt;
        }
    }

    // Called when a user submits a drawing.
    const handleDrawingSubmission = async (imageData: string) => {
        if (!game || !myPlayerId) return;

        const updatedPlayers = game.players.map((p) =>
            p.id === myPlayerId ? { ...p, locked: true } : p
        );
        const lockedCount = updatedPlayers.filter((p) => p.locked).length;

        const playerKey = `player_${myPlayerId}`;

        const currentResult = game.results?.[playerKey]?.chain || [];
        currentResult[game.round - 1].image = imageData;

        await update(ref(db, `lobbies/${code}/game/results/${playerKey}/chain`), currentResult);
        await update(ref(db, `lobbies/${code}/game`), { lockedCount });

        if (lockedCount === game.players.length) {
            handleRoundComplete();
        }
    };

    // Called when a user submits a prompt guess.
    const handlePromptSubmission = async (promptValue: string) => {
        if (!game || !myPlayerId) return;

        const updatedPlayers = game.players.map((p) =>
            p.id === myPlayerId ? { ...p, locked: true } : p
        );
        const lockedCount = updatedPlayers.filter((p) => p.locked).length;

        const playerKey = `player_${myPlayerId}`;

        const currentResult = game.results?.[playerKey]?.chain || [];
        currentResult.push({ prompt: promptValue, image: "" });

        await update(ref(db, `lobbies/${code}/game/results/${playerKey}/chain`), currentResult);
        await update(ref(db, `lobbies/${code}/game`), { lockedCount });

        if (lockedCount === game.players.length) {
            handleRoundComplete();
        }
    };

    // Advance the round or phase when all players are locked.
    const handleRoundComplete = async () => {
        if (!game || !myPlayerId) return;
        const { round, totalRounds, phase, players } = game;

        let nextPhase = phase;
        let nextRound = round;
        if (phase === "drawing") {
            nextPhase = "guessing";
        } else if (phase === "guessing") {
            nextRound = round + 1;
            if (nextRound > totalRounds) {
                nextPhase = "complete";
            } else {
                nextPhase = "drawing";
            }
        }

        const updatedPlayers = players.map((p) => ({ ...p, locked: false }));

        await update(ref(db, `lobbies/${code}/game`), {
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers,
            timer: Date.now() + 60000,
            lockedCount: 0,
        });

        socket.emit("update_game_state", {
            code,
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers,
        });
    };

    if (isLoading || !game) {
        return <div>Loading...</div>;
    }

    const { phase, timer, round, totalRounds } = game;
    const timeLeftInSeconds = convertTimestampToSeconds(timer);

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            <h1 className="text-xl font-semibold">
                Round {round} / {totalRounds}
            </h1>
            <h2 className="text-xl font-semibold">Phase: {phase.toUpperCase()}</h2>

            {phase === "drawing" && (
                <Whiteboard
                    timer={timeLeftInSeconds}
                    prompt={currentPrompt}
                    isLocked={game.players.find((p) => p.id === myPlayerId)?.locked || false}
                    onLock={handleDrawingSubmission}
                />
            )}
            {phase === "guessing" && (
                <GamePrompt
                    timer={timeLeftInSeconds}
                    onComplete={handlePromptSubmission}
                />
            )}
        </main>
    );
}