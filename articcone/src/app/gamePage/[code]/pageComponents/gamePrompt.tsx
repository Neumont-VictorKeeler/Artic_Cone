import { ProgressBar } from "@/components/ProgressBar";
import PromptInput from "@/components/PromptInput";
import React, { useState } from "react";

export default function GamePrompt() {
    const userInputBox = React.useRef<any>(null);
    const [promptValue, setPromptValue] = useState("");

    const handleComplete = () => {
        userInputBox.current?.setDisabled(true);
        console.log(userInputBox.current?.getPrompt());
    };

    return (
        <main className="w-screen h-screen bg-green-500 flex flex-col h-screen">
            <div className="m-3">
                <ProgressBar duration={10} onComplete={handleComplete} />
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
        </main>
    );
}