"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

// Dynamically import Whiteboard and GamePrompt so they load only on the client
const Whiteboard = dynamic(() => import("./pageComponents/gameCanvas"), { ssr: false });
const GamePrompt = dynamic(() => import("./pageComponents/gamePrompt"), { ssr: false });

export default function GamePage() {
    const [state, setState] = useState("whiteboard");
    const params = useParams();
    const router = useRouter();
    const lobbyCode = params.code as string;

    async function getGameState(lobbyId: string) {
        try {
            const gameStateRef = ref(db, `lobbies/${lobbyId}/gameState`);
            const snapshot = await get(gameStateRef);
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.log("No gameState found for lobby:", lobbyId);
                return null;
            }
        } catch (error) {
            console.error("Error retrieving game state:", error);
            return null;
        }
    }

    useEffect(() => {
        if (lobbyCode) {
            getGameState(lobbyCode).then((gameState) => {
                if (gameState === null) {
                    // Game not found: redirect back to the lobby page
                    router.push("/");
                } else if (gameState === "started") {
                    setState("whiteboard");
                } else {
                    setState("prompt");
                }
            });
        }
    }, [lobbyCode, router]);

    if (state === "whiteboard") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
                <Whiteboard />
            </div>
        );
    } else if (state === "prompt") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
                <GamePrompt />
            </div>
        );
    }
}