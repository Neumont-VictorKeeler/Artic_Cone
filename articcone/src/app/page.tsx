'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState('');
    const [error, setError] = useState('');
    

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
            <div className="flex flex-col items-center">
                <img
                    src="/articcone-logo.png"
                    alt="Artic Cone Logo"
                    className="w-full max-w-[500px] h-auto mb-4"
                />
                <h1 className="text-4xl font-bold text-primary">ARTIC CONE</h1>
            </div>

            <div className="mt-8 flex flex-col items-center">
                <input
                    type="text"
                    placeholder="Enter Lobby Code"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    className="text-center text-lg border-2 border-input rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex space-x-4">
                    <button
                        // onClick={joinLobby}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
                    >
                        Join Lobby
                    </button>
                    <button
                        // onClick={createLobby}
                        className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90"
                    >
                        Create Lobby
                    </button>
                </div>
            </div>
        </main>
    );
}
