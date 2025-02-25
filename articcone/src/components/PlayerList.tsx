"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Player } from "@/hooks/useLobby";

interface PlayerListProps {
    players: Player[];
    currentPlayerId: string | null;
    isHost: boolean;
    onKick: (id: string) => void;
    onMakeHost: (id: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
                                                   players,
                                                   currentPlayerId,
                                                   isHost,
                                                   onKick,
                                                   onMakeHost,
                                               }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-md space-y-2">
            {players.map((player) => (
                <div
                    key={player.id}
                    className="flex flex-col md:flex-row justify-between w-full p-3 border rounded-lg shadow-md bg-gradient-to-b from-white to-blue-100 text-amber-950 text-lg"
                >
          <span>
            {player.name} {player.isHost && "👑"}
          </span>
                    {isHost && player.id !== currentPlayerId && (
                        <div className="flex space-x-2 mt-2 md:mt-0">
                            <Button
                                variant="secondary"
                                onClick={() => onMakeHost(player.id)}
                                className="px-2 py-1 text-sm"
                            >
                                Make Host
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => onKick(player.id)}
                                className="px-2 py-1 text-sm"
                            >
                                Kick
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PlayerList;
