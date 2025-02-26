"use client";

import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

interface EndScreenProps {
    code: string;
}

interface Player {
    id: string;
    name: string;
}

interface ChainEntry {
    prompt?: string;
    image?: string;
}

interface GameResults {
    [key: string]: { chain: ChainEntry[] };
}

const EndScreen: React.FC<EndScreenProps> = ({ code }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [results, setResults] = useState<GameResults>({});
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    useEffect(() => {
        const gameRef = ref(db, `lobbies/${code}/game`);
        const unsub = onValue(gameRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Assuming that top-level players are stored under lobbies/<code>/players:
                const playersArr = Object.entries(data.players).map(([id, info]: [string, any]) => ({
                    id,
                    name: info.name,
                }));
                setPlayers(playersArr);
                setResults(data.results);
                if (playersArr.length > 0) {
                    setSelectedPlayer(playersArr[0].id);
                }
            }
        });
        return () => unsub();
    }, [code]);

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-1/4 p-4 border-r bg-white shadow-md">
                <h2 className="text-xl font-semibold mb-4">Players</h2>
                <div className="space-y-2">
                    {players.map((player) => (
                        <button
                            key={player.id}
                            className={`w-full p-3 rounded-lg text-left ${
                                selectedPlayer === player.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                            }`}
                            onClick={() => setSelectedPlayer(player.id)}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col flex-grow p-6 items-center">
                <h1 className="text-3xl font-bold mb-6">Drawing Chain</h1>
                {selectedPlayer && results[`player_${selectedPlayer}`] ? (
                    <div className="space-y-6 w-full max-w-lg">
                        {results[`player_${selectedPlayer}`].chain.map((entry, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                                {entry.prompt && <h2 className="text-xl font-semibold mb-3">{entry.prompt}</h2>}
                                {entry.image && (
                                    <img
                                        src={entry.image.startsWith("data:") ? entry.image : `data:image/png;base64,${entry.image}`}
                                        alt={`Step ${index + 1}`}
                                        className="w-80 h-80 object-cover rounded-lg"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No chain data found for this player.</p>
                )}
            </div>
        </div>
    );
};

export default EndScreen;
