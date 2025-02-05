'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Lobby() {
    const { code } = useParams(); // Get the lobby code from the URL
    const [players, setPlayers] = useState<string[]>([]);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');

    const joinLobby = () => {
        if (!playerName.trim()) {
            setError('Player name is required!');
            return;
        }
        if (players.includes(playerName)) {
            setError('Player name already exists!');
            return;
        }
        setPlayers((prev) => [...prev, playerName]);
        setPlayerName('');
        setError('');
    };

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground space-y-6">
            {/* Lobby Code Section */}
            <h1 className="text-2xl font-bold">
                Lobby Code: <span className="text-primary">{code}</span>
            </h1>

            {/* Player Name Input Section */}
            <div className="flex flex-col items-center space-y-4">
                <Input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-64"
                />
                <Button variant="default" onClick={joinLobby}>
                    Join Lobby
                </Button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Player List Section */}
            <div className="w-64 bg-card rounded-lg p-4 shadow-md">
                <h2 className="text-lg font-semibold mb-2">Players in the Lobby:</h2>
                <ul className="list-disc list-inside space-y-1">
                    {players.length > 0 ? (
                        players.map((player, index) => <li key={index}>{player}</li>)
                    ) : (
                        <p className="text-muted-foreground text-sm">No players yet.</p>
                    )}
                </ul>
            </div>
        </main>
    );
}
