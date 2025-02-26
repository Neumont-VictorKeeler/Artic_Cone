"use client"

import React, { useState, useEffect, useRef } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import PromptInput from "@/components/PromptInput";

interface GamePromptProps {
    timer: number;
    onComplete: (promptValue: string) => void;
    image: string;
}

export default function GamePrompt({ timer, onComplete, image }: GamePromptProps) {
    const userInputBox = useRef<any>(null);
    const [promptValue, setPromptValue] = useState("");
    const [timeLeft, setTimeLeft] = useState(timer);
    const [locked, setLocked] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0 && !locked) {
            onComplete(promptValue);
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onComplete(promptValue);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, locked, onComplete, promptValue]);

    const handleLockClick = () => {
        if (!locked) {
            userInputBox.current.setDisabled(true);
            setLocked(true);
            setButtonDisabled(true);
            if (!promptValue) {
                onComplete("Last Player Forgot A Prompt");
            } else {
                onComplete(promptValue);
            }
        }
    };

    // Convert image data to a proper src string.
    // If image already starts with "data:" then use it as-is,
    // otherwise prepend the proper data URI prefix.
    const imgSrc = image
        ? (image.startsWith("data:") ? image : `data:image/png;base64,${image}`)
        : null;

    return (
        <main className="w-screen h-screen flex flex-col">
            <div className="m-3">
                <ProgressBar duration={timeLeft} onComplete={handleLockClick} />
            </div>

            {imgSrc ? (
                <img
                    src={imgSrc}
                    alt="Submitted Drawing"
                    className="flex items-center mx-auto justify-center mb-2 w-3/4 border-2 border-black bg-white rounded-md"
                />
            ) : null}

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
                className="bg-red-600 w-32 mx-auto mt-1 p-2 text-white rounded"
            >
                {locked ? "Locked" : "Lock"}
            </button>
        </main>
    );
}
