"use client";

import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface EndScreenProps {
    code: string;
}

interface Player {
    id: string;
    name?: string;
}

interface ChainEntry {
    prompt?: string;
    image?: string;
}

interface PlayerResults {
    chain: ChainEntry[];
}

interface GameData {
    players: Player[] | Record<string, Player>;
    results: Record<string, PlayerResults>;
}

export default function EndScreen({ code }: EndScreenProps) {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [results, setResults] = useState<Record<string, PlayerResults>>({});
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    useEffect(() => {
        const gameRef = ref(db, `lobbies/${code}/game`);
        const unsub = onValue(gameRef, (snapshot) => {
            if (!snapshot.exists()) return;
            const data = snapshot.val() as GameData;

            let playersArr: Player[] = Array.isArray(data.players) ? data.players : Object.values(data.players);
            setPlayers(playersArr);
            setResults(data.results || {});

            if (playersArr.length > 0) {
                setSelectedPlayer(playersArr[0].id);
            }
        });
        return () => unsub();
    }, [code]);

    const handleLeaveGame = async () => {
        localStorage.removeItem("lobbyCode");
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
        toast.success("You have left the lobby.");
        router.push("/");
    };

    const chainKey = selectedPlayer ? `player_${selectedPlayer}` : null;
    const chain = chainKey && results[chainKey]?.chain ? results[chainKey].chain : [];

    return (
        <div
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">

            <div
                className="w-full max-w-lg space-y-4 bg-white/80 p-6 rounded-lg shadow-md border border-gray-300 text-center">
                <h2 className="text-2xl font-semibold text-amber-900">Players:</h2>
                <div className="space-y-2">
                    {players.map((player) => (
                        <Button
                            key={player.id}
                            className={`w-full text-lg ${selectedPlayer === player.id ? "bg-green-200" : "bg-blue-200 hover:bg-blue-300"}`}
                            onClick={() => setSelectedPlayer(player.id)}
                        >
                            {player.name || player.id}
                        </Button>
                    ))}
                </div>
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent mb-6">
                {selectedPlayer ? `${players.find(p => p.id === selectedPlayer)?.name || selectedPlayer}'s Game Chain` : "Select a player"}
            </h1>

            {selectedPlayer && chain.length > 0 ? (
                <div className="w-full max-w-lg space-y-6 mt-6">
                    {chain.map((entry, index) => (
                        <div key={index}
                             className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center border border-gray-300">
                            {entry.prompt && (
                                <h2 className="text-xl font-semibold mb-3 text-amber-900">{entry.prompt}</h2>
                            )}
                            {entry.image && (
                                <img
                                    src={entry.image.startsWith("data:") ? entry.image : `data:image/png;base64,${entry.image}`}
                                    alt={`Step ${index + 1}`}
                                    className="w-80 h-80 object-cover rounded-lg border border-gray-300"
                                />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xl font-semibold text-gray-600 mt-6">No chain data found for this player.</p>
            )}

            <Button variant="destructive" className="mt-6" onClick={handleLeaveGame}>
                Leave Game
            </Button>
        </div>
    );
}
