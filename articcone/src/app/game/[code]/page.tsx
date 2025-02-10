'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Game() {
    const { code } = useParams();
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        // Fetch game state from API or Firebase
        fetch(`/api/game?code=${code}`)
            .then(res => res.json())
            .then(data => setGameState(data));
    }, [code]);

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Game Lobby: {code}</h1>
            {/* Drawing canvas and game UI will go here */}
        </main>
    );
}
