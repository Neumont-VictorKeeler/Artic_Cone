"use client";

import React, { useState } from "react";
const gifshot = require("gifshot");

// Sample Data Mimicking Firebase Structure
const sampleData = {
    players: {
        "player1": { name: "Player 1", isHost: true },
        "player2": { name: "Player 2", isHost: false },
    },
    game: {
        results: {
        round1: {
            player1: {
            image1: "/sampleImage1.jpg",
            image2: "/sampleImage2.jpg",
            prompt1: "What an image!",
            promptRandom: "Haha goofy phrase",
            },
            player2: {
            image1: "/sampleImage3.jpg",
            prompt1: "There is an image!",
            promptRandom: "Silly phrase",
            },
        },
        round2: {
            player1: {
            image1: "/sampleImage4.png",
            prompt1: "Another masterpiece!",
            promptRandom: "Funny caption",
            },
            player2: {
                image1: "/sampleImage2.jpg",
                prompt1: "What is this?",
                promptRandom: "I am confused",
            },
        },
        },
    },
};

const EndScreen: React.FC = () => {
    const players = Object.entries(sampleData.players).map(([id, info]) => ({
        id,
        name: info.name,
    }));

    const results = sampleData.game.results;
    const [selectedPlayer, setSelectedPlayer] = useState(players[0].id);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePlayerSwitch = (playerId: string) => {
        setSelectedPlayer(playerId);
        setGifUrl(null); // Reset GIF when switching players
        setIsGenerating(false);
    };

    const createGif = () => {
        setIsGenerating(true);
        const images: string[] = [];

        Object.values(results).forEach((round: any) => {
            if (round[selectedPlayer]) {
                images.push(round[selectedPlayer].image1);
            }
            });

            gifshot.createGIF(
            {
                images: images,
                gifWidth: 300,
                gifHeight: 300,
                interval: 0.5,
            },
            (obj: { error: boolean; image: string }) => {
                setIsGenerating(false);
                if (!obj.error) {
                setGifUrl(obj.image);
                }
            }
            );
        };

    return (
        <div className="flex h-screen bg-gray-100 relative z-10">
            {/* Sidebar for Player Selection */}
            <div className="w-1/4 p-4 border-r bg-white shadow-md">
                <h2 className="text-xl font-semibold mb-4">Players</h2>
                <div className="space-y-2">
                {players.map((player) => (
                    <div
                    key={player.id}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedPlayer === player.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                    onClick={() => handlePlayerSwitch(player.id)}
                    >
                    {player.name}
                    </div>
                ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-grow p-6 items-center">
                <h1 className="text-3xl font-bold mb-6">Drawing Chain</h1>
                <div className="space-y-6 w-full max-w-lg">
                {Object.entries(results).map(([roundName, round]: any) => {
                    const playerData = round[selectedPlayer];
                    if (!playerData) return null;

                    return (
                        <div key={roundName} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-3">{playerData.prompt1}</h2>
                            <img
                            src={playerData.image1}
                            alt={`Image for ${playerData.prompt1}`}
                            className="w-80 h-80 object-cover rounded-lg"
                            />
                        </div>
                    );
                })}
                </div>

                {/* GIF Generation */}
                <div className="flex flex-col items-center mt-8">
                {!gifUrl && (
                    <button
                    onClick={createGif}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50"
                    disabled={isGenerating}
                    >
                    {isGenerating ? "Generating GIF..." : "Generate GIF"}
                    </button>
                )}
                {gifUrl && (
                    <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Generated GIF</h2>
                    <img src={gifUrl} alt="Generated GIF" className="w-80 h-80 object-cover rounded-lg shadow-md" />
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default EndScreen;
