"use client";
import { ref } from "firebase/database";
import { get } from "http";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

// Dynamically import Whiteboard and GamePrompt, ensuring they are only loaded on the client
const Whiteboard = dynamic(() => import("./pageComponents/gameCanvas"), { ssr: false });
const GamePrompt = dynamic(() => import("./pageComponents/gamePrompt"), { ssr: false });

export default function GamePage() {
    const [state, setState] = useState("whiteboard");
    function getGameState() {
        setState("whiteboard");
    }
    useEffect(() => {
    }, []);
    
    return state === "whiteboard" ? <Whiteboard /> : <GamePrompt />;
}
