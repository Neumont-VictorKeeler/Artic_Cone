import React, { useRef, useState, useEffect } from "react";
import Canvas from "@/components/canvas";
import Lockscreen from "@/components/lockscreen";
import { ProgressBar } from "@/components/progressbar";
import { set } from "firebase/database";
export default function Whiteboard() {
    const canvasRef = useRef<any>(null);
    const [PROMPT, setPrompt] = useState("");
    const [isEnabled, setEnabled] = useState(false);
    const lockscreen = () => { setEnabled(true); canvasRef.current?.disableCanvas();};
    useEffect(() => {
        setPrompt("BANANA");
        setEnabled(false);
    }, []);
    return (
        <main className="bg-green-500 w-screen h-screen">
            <h1 className="text-2xl font-bold text-center mx-5  mt-5 border-2 border-black rounded-md bg-white">Prompt: {PROMPT}</h1>
            <div>
            <ProgressBar className="flex w-3/4 mx-5 mb-auto mt-2 bg-white border-2 border-black" duration={10} onComplete={() => lockscreen()}/>
            <Lockscreen isEnabled={isEnabled}/>
            <Canvas ref={canvasRef}/>
            </div>
        </main>
    );
}