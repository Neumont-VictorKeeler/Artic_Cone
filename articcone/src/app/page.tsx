'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState('');
    const [error, setError] = useState('');

    const checkAndJoinLobby = async () => {
        if (!lobbyCode) {
            setError('Please enter a lobby code.');
            return;
        }

        try {
            const response = await fetch(`/api/lobby?code=${lobbyCode}`);
            const data = await response.json();

            if (data.exists) {
                router.push(`/lobby/${lobbyCode}`);
            } else {
                setError('Lobby does not exist!');
            }
        } catch (err) {
            setError('Error checking lobby.');
        }
    };

    const createLobby = async () => {
        const response = await fetch('/api/lobby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "create" }),
        });

        const data = await response.json();
        if (data.success) {
            router.push(`/lobby/${data.code}`); // Use the generated lobby code from the server
        } else {
            setError('Failed to create lobby.');
        }
    };


    return (
        <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
            <div className="flex flex-col items-center">
                <img src="/articcone-logo.png" alt="Artic Cone Logo" className="w-full max-w-[500px] h-auto mb-4" />
                <h1 className="text-4xl font-bold text-primary">ARTIC CONE</h1>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-4">
                <Input
                    type="text"
                    placeholder="Enter Lobby Code"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    className="text-center"
                />
                {error && <p className="text-red-500 font-medium text-center mt-2">{error}</p>}

                <div className="flex space-x-4">
                    <Button variant="default" onClick={checkAndJoinLobby}>
                        Join Lobby
                    </Button>
                    <Button variant="secondary" onClick={createLobby}>
                        Create Lobby
                    </Button>
                </div>
            </div>
        </main>
    );
}
