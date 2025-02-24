import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ProgressBar";
import React from "react";
let counter;
export default function GamePrompt() {
    const handleComplete = () => {
        clearInterval(counter);
    }
    return (
        <main className="bg-green-500 flex flex-col h-screen">
            <div className="flex items-center mx-auto justify-center mt-auto w-3/4  border-2 border-gray bg-gray-700 rounded-md">
                <ProgressBar duration={240} onComplete={handleComplete}/>
            </div>
            <img src="" alt="IMAGE PLACEHOLDER" className="flex items-center mx-auto justify-center  mb-2 size-3/4 border-2 border-black bg-white rounded-md" />
            <h1 className="text-2xl font-bold text-center">WRITE A PROMPT BASED OFF THIS IMAGE!</h1>
            <Input type="text" className="flex w-3/4 mx-auto mb-auto mt-2 bg-white border-2 border-black" placeholder="Enter prompt here"></Input>
        </main>
    );
}