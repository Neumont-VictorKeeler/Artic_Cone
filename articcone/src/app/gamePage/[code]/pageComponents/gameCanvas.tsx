"use client"

import React, { useRef, useState, useEffect } from "react";
import Canvas from "@/components/canvas";
import Lockscreen from "@/components/Lockscreen";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";

interface WhiteboardProps {
    timer: number;
    prompt: string;
    isLocked: boolean;
    onLock: () => void;
}

export default function Whiteboard({ timer, prompt, isLocked, onLock }: WhiteboardProps) {
    const canvasRef = useRef<any>(null);

    useEffect(() => {
        if (timeLeft <= 0) {
            onLock();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onLock();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onLock]);

    useEffect(() => {
        if (isLocked) {
            canvasRef.current?.disableCanvas();
        } else {
            canvasRef.current?.enableCanvas();
        }
    }, [isLocked]);

    return (
        <main className="w-full h-screen flex flex-col items-center overflow-hidden">
            <div className="flex bg-white shadow-lg rounded-lg justify-center p-4 w-3/4 max-w-lg text-center border-2 border-black m-2">
                <h1 className="text-2xl font-bold">Prompt: {prompt}</h1>
            </div>

            <Button
                className={`w-3/4 ${isLocked ? "bg-blue-500" : "bg-red-500"} shadow-lg rounded-lg justify-center border-2 border-black m-1`}
                onClick={onLock}
                disabled={isLocked}
            >
                {isLocked ? "Locked" : "Lock"}
            </Button>

            <div className="relative w-full mx-1">
                <ProgressBar
                    className="w-3/4 min-h-[12px] bg-white border-2 border-black rounded-lg mt-4"
                    duration={timeLeft}
                    onComplete={onLock}
                />

                <div className="relative w-full">
                    <Canvas ref={canvasRef} />
                    <Lockscreen isEnabled={isLocked} />
                </div>
            </div>
        </main>
    );
}