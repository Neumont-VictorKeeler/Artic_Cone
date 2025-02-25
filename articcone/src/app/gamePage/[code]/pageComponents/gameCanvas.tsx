import React, { useRef, useState, useEffect } from "react";
import Canvas from "@/components/canvas";

import Lockscreen from "@/components/lockscreen";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { set } from "firebase/database";

export default function Whiteboard() {
    const canvasRef = useRef<any>(null);
    const [PROMPT, setPrompt] = useState("");
    const [isEnabled, setEnabled] = useState(false);
    const [done, setDone] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const lockscreen = (roundEnd: boolean) => { 
        if (roundEnd){ 
        setDone(true);
        setButtonDisabled(true);
        setEnabled(true); 
        canvasRef.current?.disableCanvas();
        }else{
            setEnabled(true);
            canvasRef.current?.disableCanvas();
        }
    };
    
    const unlockscreen = () => {
        setEnabled(false);
        canvasRef.current?.enableCanvas();
    }

    const doneBtnClick = () => {
        if (buttonDisabled) return; // Prevent multiple clicks

        setButtonDisabled(true); // Disable button
        setTimeout(() => setButtonDisabled(false), 1000);
         setDone(!done);
         done ? unlockscreen() : lockscreen(false);
         }
    useEffect(() => {
        setPrompt("BANANA");
        setEnabled(false);
    }, []);

    return (
        <main className="w-full h-screen flex flex-col items-center  bg-gradient-to-br from-green-600 to-blue-400 overflow-hidden">
            <div className="flex bg-white shadow-lg rounded-lg justify-center p-4 w-3/4 max-w-lg text-center border-2 border-black m-2">
                <h1 className="text-2xl font-bold">Prompt: {PROMPT}</h1>
            </div>
            <Button 
                className={`w-3/4 ${done ? 'bg-blue-500' : 'bg-red-500'} shadow-lg rounded-lg justify-center  border-2 border-black m-1`}
                onClick={doneBtnClick}
                disabled={buttonDisabled}
            >
                {done ? "Unlock" : "lock"}
            </Button>

            <div className="relative w-full mx-1 ">
                <ProgressBar 
                className="w-3/4 min-h-[12px] bg-white border-2 border-black rounded-lg mt-4" 
                duration={2} 
                onComplete={() => lockscreen(true)}
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
