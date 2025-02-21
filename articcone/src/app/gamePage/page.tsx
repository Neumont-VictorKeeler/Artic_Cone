"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

// Dynamically import Whiteboard and GamePrompt, ensuring they are only loaded on the client
const Whiteboard = dynamic(() => import("./pageComponents/gameCanvas"), { ssr: false });
const GamePrompt = dynamic(() => import("./pageComponents/gamePrompt"), { ssr: false });

export default function GamePage() {
    const [state, setState] = useState("whiteboard");

    async function getGameState() {
        setState("whiteboard");
    }

    useEffect(() => {
        getGameState();
    }, []);

    return state === "whiteboard" ? <Whiteboard /> : <GamePrompt />;
}
