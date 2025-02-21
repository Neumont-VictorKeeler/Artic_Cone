import React, { useState, useEffect } from "react";
import Canvas from "@/components/canvas";

export default function Whiteboard() {
    const [PROMPT, setPrompt] = useState("");
    useEffect(() => {
        setPrompt("BANANA")
    }, []);
    return (
        <main className="bg-green-500 flex flex-col h-screen">
            <h1 className="text-2xl font-bold text-center mx-5  mt-5 border-2 border-black rounded-md bg-white">Prompt: {PROMPT}</h1>
            <Canvas />
        </main>
    );
}