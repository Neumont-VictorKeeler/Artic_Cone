"use client";

import React from "react";
import { toast } from "react-hot-toast";

interface LobbyHeaderProps {
    code: string;
}

const LobbyHeader: React.FC<LobbyHeaderProps> = ({ code }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!");
    };

    return (
        <div
            className="relative group cursor-pointer mt-4 p-2 border-2 border-transparent rounded-lg hover:border-blue-500 hover:bg-blue-200 transition duration-200"
            onClick={handleCopy}
        >
            <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                Lobby Code: {code}
            </h1>
            <span className="absolute left-1/2 bottom-[-30px] transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm shadow-lg">
        Click to copy the lobby code!
      </span>
        </div>
    );
};

export default LobbyHeader;
