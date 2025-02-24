import React, { useRef, useState, useEffect } from "react";
import Canvas from "@/components/canvas";
import Lockscreen from "@/components/lockscreen";
import { ProgressBar } from "@/components/ProgressBar";

export default function Whiteboard() {
    const canvasRef = useRef<any>(null);
    const [PROMPT, setPrompt] = useState("");
    const [isEnabled, setEnabled] = useState(false);

    const lockscreen = () => { 
        setEnabled(true); 
        canvasRef.current?.disableCanvas();
    };

    useEffect(() => {
        setPrompt("BANANA");
        setEnabled(false);
    }, []);

    return (
        <main className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-blue-400">
            <div className="bg-white shadow-lg rounded-lg p-4 w-3/4 max-w-lg text-center border-2 border-black">
                <h1 className="text-2xl font-bold">Prompt: {PROMPT}</h1>
            </div>

            <div>
                <ProgressBar 
                className="w-3/4 min-h-[12px] bg-white border-2 border-black rounded-lg mt-4" 
                duration={10} 
                onComplete={() => lockscreen()}
            />
            

            <Lockscreen isEnabled={isEnabled} />

                <Canvas 
                    ref={canvasRef} 
                    className="w-full border-2 border-black rounded-lg shadow-lg" 
                />
            </div>
        </main>
    );
}
