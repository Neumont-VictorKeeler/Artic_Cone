"use client";
import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import socket from "@/lib/socket";

// Components:
import Canvas from "@/components/canvas";
import PromptInput from "@/components/PromptInput";
import { ProgressBar } from "@/components/ProgressBar";

interface GamePlayer {
    id: string;
    name: string;
    prompt: string;
    imageToGuess?: string; // Add this property
}

interface GameData {
    round: number;
    totalRounds: number;
    phase: "drawing" | "guessing" | "complete";
    players: GamePlayer[];
    results?: any;
    timer?: number; // Added this property
}

export default function GamePage() {
    const router = useRouter();
    const { code } = useParams();
    const [game, setGame] = useState<GameData | null>(null);
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

    // Local UI states
    const [myPrompt, setMyPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Grab local storage ID
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
            const data = snapshot.val() as GameData;
            setGame(data);
            setIsLoading(false);

            // Set the timer end time in local storage
            if (data.timer) {
                localStorage.setItem("timerEndTime", data.timer.toString());
            }

            if (data.phase === "complete") {
                router.push(`/gameResults/${code}`);
            }
        });
    }, [code, router]);

    useEffect(() => {
        if (!game || !myPlayerId) return;
        const me = game.players.find((p) => p.id === myPlayerId);
        if (!me) {
            toast.error("You are not in this game.");
            router.push("/");
            return;
        }
        if (game.phase === "drawing") {
            setMyPrompt(me.prompt);
        }
    }, [game, myPlayerId, router]);

    const handleRoundComplete = async () => {
        if (!game || !myPlayerId) return;
        const { round, totalRounds, phase, results = {} } = game;

        let drawingDataURL = "";
        if (phase === "drawing" && canvasRef.current) {
            drawingDataURL = canvasRef.current.toDataURL();
        }

        let guessedPrompt = "";
        if (phase === "guessing") {
            guessedPrompt = myPrompt;
        }

        const newRoundData: Record<string, any> = results[`round${round}`] || {};
        const myPrevData = newRoundData[myPlayerId] || {};

        if (phase === "drawing") {
            myPrevData.drawing = drawingDataURL;
            myPrevData.prompt = myPrevData.prompt || "";
        } else if (phase === "guessing") {
            myPrevData.prompt = guessedPrompt;
            myPrevData.drawing = myPrevData.drawing || "";
        }
        newRoundData[myPlayerId] = myPrevData;

        const roundKey = `round${round}`;
        await update(ref(db, `lobbies/${code}/game/results`), {
            [roundKey]: newRoundData,
        });

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

        let updatedPlayers = [...game.players];
        if (nextPhase === "drawing" && nextRound <= totalRounds) {
            const playerCount = updatedPlayers.length;
            const roundData = newRoundData;
            updatedPlayers = updatedPlayers.map((p, i) => {
                const prevIndex = (i - 1 + playerCount) % playerCount;
                const prevPlayer = game.players[prevIndex];
                const prevPlayerResults = roundData[prevPlayer.id];
                const newPrompt = prevPlayerResults?.prompt || "???";
                return {
                    ...p,
                    prompt: newPrompt,
                };
            });
        }

        if (nextPhase === "guessing") {
            const playerCount = updatedPlayers.length;
            const roundData = newRoundData;
            updatedPlayers = updatedPlayers.map((p, i) => {
                const prevIndex = (i - 1 + playerCount) % playerCount;
                const prevPlayer = game.players[prevIndex];
                const prevPlayerResults = roundData[prevPlayer.id];
                const imageToGuess = prevPlayerResults?.drawing || "";
                return {
                    ...p,
                    prompt: p.prompt,
                    imageToGuess,
                };
            });
        }

        await update(ref(db, `lobbies/${code}/game`), {
            round: nextRound,
            phase: nextPhase,
            players: updatedPlayers,
            timer: Date.now() + 60000, // Set the timer to 60 seconds from now
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

    const { phase } = game;
    const me = game.players.find((p) => p.id === myPlayerId);
    if (!me) {
        return <div>You are not a player in this game.</div>;
    }

    return (
        <main className="min-h-screen flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-2">Round {game.round} / {game.totalRounds}</h1>
            <h2 className="text-xl mb-4">
                Phase: {phase.toUpperCase()}
            </h2>

            {phase === "drawing" && (
                <div className="bg-white p-3 mb-3 border-2 border-black rounded">
                    <p className="font-bold">Prompt: {myPrompt}</p>
                </div>
            )}
            {phase === "guessing" && me.imageToGuess && (
                <div className="bg-white p-3 mb-3 border-2 border-black rounded">
                    <img
                        src={me.imageToGuess}
                        alt="Drawing to guess"
                        style={{ maxWidth: 300, maxHeight: 300 }}
                    />
                </div>
            )}

            <ProgressBar
                duration={60}
                onComplete={handleRoundComplete}
                className="w-full max-w-lg"
            />

            {phase === "drawing" ? (
                <Canvas ref={canvasRef} />
            ) : phase === "guessing" ? (
                <PromptInput
                    value={myPrompt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyPrompt(e.target.value)}
                />
            ) : (
                <div className="text-2xl">Game Complete (or unknown phase)</div>
            )}
        </main>
    );
}