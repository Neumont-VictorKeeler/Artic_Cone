import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ProgressBar";
import PromptInput from "@/components/PromptInput";
import React from "react";
import { set } from "firebase/database";
let counter;
export default function GamePrompt() {
    const userInputBox = React.useRef<any>(null);  
    const handleComplete = () => {
        clearInterval(counter);
        userInputBox.current?.setDisabled(true);
        console.log(userInputBox.current?.getPrompt());
    }
    return (
        <main className="bg-green-500 flex flex-col h-screen">
            <div className = "m-3">
                
            <ProgressBar duration={10} onComplete={handleComplete}/>
            </div>
            
            <img src="null" alt="IMAGE PLACEHOLDER" className="flex items-center mx-auto justify-center  mb-2 size-3/4 border-2 border-black bg-white rounded-md" />
            <h1 className="text-2xl font-bold text-center">WRITE A PROMPT BASED OFF THIS IMAGE!</h1>
            <Input type="text" className="flex w-3/4 mx-auto mb-auto mt-2 bg-white border-2 border-black" placeholder="Enter prompt here"></Input>
            <PromptInput ref = {userInputBox} />
        </main>
    );
}