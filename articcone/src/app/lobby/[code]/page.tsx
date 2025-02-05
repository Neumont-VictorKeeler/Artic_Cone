'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function Lobby() {
    const { code } = useParams(); // Get the lobby code from the URL
    const [players, setPlayers] = useState<string[]>([]);
    const [playerName, setPlayerName] = useState('');
    

    return (
        <main style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Lobby Code: {code}</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button 
                    // onClick={joinLobby}
                    style={{ padding: '5px 10px' }}>
                    Join Lobby
                </button>
            </div>
            <h2>Players in the Lobby:</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
        </main>
    );
}
