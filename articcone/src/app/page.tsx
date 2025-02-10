'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"; // Import Button
import { Input } from "@/components/ui/input"; // Import Input

export default function Home() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState('');
    const [error, setError] = useState('');

    const createLobby = () => {
        // Generate lobby code only on the client
        if (typeof window !== 'undefined') {
            const newLobbyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            router.push(`/lobby/${newLobbyCode}`);
        }
    };

    return (
        <main
            suppressHydrationWarning
            className="flex flex-col items-center justify-center h-screen bg-background text-foreground"
        >
            {/* Logo Section */}
            <div className="flex flex-col items-center">
                <img
                    src="/articcone-logo.png"
                    alt="Artic Cone Logo"
                    className="w-full max-w-[500px] h-auto mb-4"
                />
                <h1 className="text-4xl font-bold text-primary">ARCTIC CONE</h1>
            </div>

            {/* Input and Buttons Section */}
            <div className="mt-8 flex flex-col items-center space-y-4">
                {/* Input Field */}
                <Input
                    type="text"
                    placeholder="Enter Lobby Code"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    className="text-center"
                />
                {error && (
                    <p className="text-red-500 font-medium text-center mt-2">
                        {error}
                    </p>
                )}

                {/* Buttons */}
                <div className="flex space-x-4">
                    <Button
                        variant="default"
                        onClick={() => {
                            if (!lobbyCode) {
                                setError('Please enter a lobby code.');
                                return;
                            }
                            router.push(`/lobby/${lobbyCode}`);
                        }}
                    >
                        Join Lobby
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={createLobby}
                    >
                        Create Lobby
                    </Button>
                </div>
            </div>
        </main>
    );
}
