'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Lobby() {
    const params = useParams();
    const code = params?.code as string;
    const router = useRouter();
    const [players, setPlayers] = useState<string[]>([]);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!code) return;

        const checkLobbyExists = async () => {
            try {
                const response = await fetch(`/api/lobby?code=${code}`);
                const data = await response.json();

                if (!data.exists) {
                    router.push('/'); // Redirect if lobby doesn't exist
                } else {
                    setPlayers(data.players || []);
                }
            } catch {
                setError('Error fetching lobby.');
            } finally {
                setLoading(false);
            }
        };

        checkLobbyExists();
    }, [code, router]);

    const joinLobby = async () => {
        if (!playerName.trim()) {
            setError('Player name is required!');
            return;
        }

        try {
            const response = await fetch('/api/lobby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, playerName, action: "join" }),
            });

            const data = await response.json();
            if (data.success) {
                setPlayers(data.players);
                setPlayerName('');
                setError('');
            } else {
                setError(data.error || 'Error joining lobby.');
            }
        } catch {
            setError('Error joining lobby.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground space-y-6">
            <h1 className="text-2xl font-bold">
                Lobby Code: <span className="text-primary">{code}</span>
            </h1>

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
