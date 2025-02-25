import React, { useRef, useState, useEffect } from "react";
import Canvas from "@/components/canvas";

import Lockscreen from "@/components/Lockscreen";
import { ProgressBar } from "@/components/ProgressBar";
import { set } from "firebase/database";

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
        <main className="w-full h-screen flex flex-col items-center  bg-gradient-to-br from-green-600 to-blue-400 overflow-hidden">
            <div className="flex bg-white shadow-lg rounded-lg justify-center p-4 w-3/4 max-w-lg text-center border-2 border-black m-5">
                <h1 className="text-2xl font-bold">Prompt: {PROMPT}</h1>
            </div>

            <div className="relative w-full mx-1 ">
                <ProgressBar 
                className="w-3/4 min-h-[12px] bg-white border-2 border-black rounded-lg mt-4" 
                duration={500} 
                onComplete={() => lockscreen()}
            />
            

            
            <div className="relative w-full ">
                <Canvas 
                    ref={canvasRef} 
                    className="" 
                />
                <Lockscreen isEnabled={isEnabled} />
            </div>
                
            </div>
        </main>
    );
}
