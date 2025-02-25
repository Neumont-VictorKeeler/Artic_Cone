"use client"

import React, { useState, useEffect, useRef } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import PromptInput from "@/components/PromptInput";

interface GamePromptProps {
    timer: number;
    onComplete: () => void;
}

export default function GamePrompt({ timer, onComplete }: GamePromptProps) {
    const userInputBox = useRef<any>(null);
    const [promptValue, setPromptValue] = useState("");
    const [timeLeft, setTimeLeft] = useState(timer);
    const [locked, setLocked] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0 && !locked) {
            onComplete();
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, locked, onComplete]);

    const handleLockClick = () => {
        if (!locked) {
            onComplete();
        }
    };

    return (
        <main className="w-screen h-screen flex flex-col">
            <div className="m-3">
                <ProgressBar duration={timeLeft} onComplete={onComplete} />
            </div>

            <img
                src="null"
                alt="IMAGE PLACEHOLDER"
                className="flex items-center mx-auto justify-center mb-2 size-3/4 border-2 border-black bg-white rounded-md"
            />
            <h1 className="text-2xl font-bold text-center">
                WRITE A PROMPT BASED OFF THIS IMAGE!
            </h1>

            <PromptInput
                ref={userInputBox}
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
            />

            <button
                onClick={handleLockClick}
                disabled={buttonDisabled}
                className="bg-red-600 w-32 mx-auto mt-4 p-2 text-white rounded"
            >
                {locked ? "Locked" : "Lock"}
            </button>
        </main>
    );
}