"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface LobbyControlsProps {
    isHost: boolean;
    onStartGame: () => void;
    onDeleteLobby: () => void;
}

const LobbyControls: React.FC<LobbyControlsProps> = ({
                                                        isHost,
                                                        onStartGame,
                                                        onDeleteLobby,
                                                    }) => {
    return (
        <div className="mt-6 flex flex-col items-center space-y-4 w-full max-w-xs">
            {isHost && (
                <Button
                    variant="default"
                    className="bg-gradient-to-b from-white to-blue-100 hover:from-green-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                    onClick={onStartGame}
                >
                    Start Game
                </Button>
            )}
            {isHost && (
                <Button
                    variant="destructive"
                    className="bg-gradient-to-b from-white to-blue-100 hover:from-red-100 hover:to-white shadow-md border border-gray-300 text-amber-950 disabled:opacity-50"
                    onClick={onDeleteLobby}
                >
                    Delete Lobby
                </Button>
            )}
        </div>
    );
};

export default LobbyControls;
