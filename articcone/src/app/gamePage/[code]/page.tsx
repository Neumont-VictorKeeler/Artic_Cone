"use client"

import React, { useState, useEffect } from "react";
import {ref, onValue, update} from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import socket from "@/lib/socket";
import Whiteboard from "./pageComponents/gameCanvas";
import GamePrompt from "./pageComponents/gamePrompt";

function convertTimestampToSeconds(timestamp: number): number {
    const currentTime = Date.now();
    const differenceInMilliseconds = timestamp - currentTime;
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    return differenceInSeconds;
}

interface Player {
    id: string;
    prompt: string;
    locked: boolean;
}

interface Game {
    phase: string;
    timer: number;
    players: Player[];
    round: number;
    totalRounds: number;
    results: Record<string, any>;
}

interface GameData {
    phase: string;
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
        const me = game.players.find((p: Player) => p.id === myPlayerId);
        if (!me) {
            toast.error("You are not in this game.");
            router.push("/");
        }
    }, [game, myPlayerId, router]);

    const handleRoundComplete = async () => {
        if (!game || !myPlayerId) return;
        const { round, totalRounds, phase, results = {} } = game;

        const roundKey = `round${round}`;
        const newRoundData: Record<string, any> = results[roundKey] || {};

        let nextPhase: GameData["phase"] = phase;
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

        const updatedPlayers = game.players.map((p) => ({
            ...p,
            locked: false
        }));

        await update(ref(db, `lobbies/${code}/game`), {
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers,
            results: {
                ...results,
                [roundKey]: newRoundData
            },
            timer: Date.now() + 60000,
            lockedCount: 0
        });

        socket.emit("update_game_state", {
            code,
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers
        });
    };

    if (isLoading || !game) {
        return <div>Loading...</div>;
    }

    const { phase, timer, players, round, totalRounds } = game;
    const myPlayer = players.find((p: Player) => p.id === myPlayerId);
    const timeLeftInSeconds = convertTimestampToSeconds(timer);

    return (
        <main className="min-h-screen flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-2">
                Round {round} / {totalRounds}
            </h1>
            <h2 className="text-xl mb-4">Phase: {phase.toUpperCase()}</h2>

            {phase === "drawing" && myPlayer && (
                <Whiteboard
                    timer={timeLeftInSeconds}
                    prompt={myPlayer.prompt}
                    isLocked={myPlayer.locked}
                    onLock={handleRoundComplete}
                />
            )}
            {phase === "guessing" && (
                <GamePrompt
                    timer={timeLeftInSeconds}
                    onComplete={handleRoundComplete}
                />
            )}

            {phase !== "complete" && (
                <button
                    onClick={handleRoundComplete}
                    className="bg-gray-300 px-4 py-2 rounded mt-4"
                >
                    Force Next Round
                </button>
            )}
        </main>
    );
}