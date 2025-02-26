"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
const gifshot = require("gifshot");

// Sample Data (Fallback)
const sampleGameData = {
  players: ["player1", "player2"],
  results: {
    round1: {
      player1: { image: "/sampleImage1.jpg", prompt: "A cat flying in space" },
      player2: { image: "/sampleImage2.jpg", prompt: "A robot making pancakes" }
    },
    round2: {
      player1: { image: "/sampleImage3.jpg", prompt: "A dog surfing on a wave" },
      player2: { image: "/sampleImage4.png", prompt: "A wizard casting a spell" }
    }
  }
};

const EndScreen: React.FC = () => {
  const { code } = useParams();
  const [gameData, setGameData] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      console.warn("No lobby code found, using sample data.");
      setGameData(sampleGameData);
      setSelectedPlayer(sampleGameData.players[0]);
      setError(true);
      setIsLoading(false);
      return;
    }

    const gameRef = ref(db, `lobbies/${code}/game`);
    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setGameData(data);
          setSelectedPlayer(data.players?.[0] || null);
          setError(false);
        } else {
          console.warn("No game data found, using sample data.");
          setGameData(sampleGameData);
          setSelectedPlayer(sampleGameData.players[0]);
          setError(true);
        }
      },
      (error) => {
        console.error("Error fetching game data:", error);
        setGameData(sampleGameData);
        setSelectedPlayer(sampleGameData.players[0]);
        setError(true);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [code]);

  const generateGif = () => {
    if (!selectedPlayer || !gameData) return;

    const frames = Object.values(gameData.results)
      .map((round: any) => round[selectedPlayer]?.image)
      .filter(Boolean); // Remove any empty images

    if (frames.length === 0) {
      alert("No images found to generate a GIF.");
      return;
    }

    setIsGenerating(true);

    gifshot.createGIF(
      {
        images: frames,
        interval: 0.7,
        gifWidth: 300,
        gifHeight: 300
      },
      (obj: { error: any; image: React.SetStateAction<string | null>; }) => {
        setIsGenerating(false);
        if (obj.error) {
          console.error("GIF generation failed:", obj.error);
          alert("Failed to generate GIF.");
        } else {
          setGifUrl(obj.image);
        }
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        <div className="space-y-2">
          {gameData.players.map((playerId: string) => (
            <div
              key={playerId}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedPlayer === playerId ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
              onClick={() => setSelectedPlayer(playerId)}
            >
              {playerId}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow p-6 items-center">
        <h1 className="text-3xl font-bold mb-6">Drawing Chain</h1>

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
            ⚠️ Failed to load real game data. Using sample data instead.
          </div>
        )}

        <div className="space-y-6 w-full max-w-lg">
          {Object.entries(gameData.results).map(([roundName, round]: any) => {
            const playerData = selectedPlayer ? round[selectedPlayer] : null;
            if (!playerData) return null;

            return (
              <div key={roundName} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-3">{playerData.prompt}</h2>
                <img
                  src={playerData.image}
                  alt={`Image for ${playerData.prompt}`}
                  className="w-80 h-80 object-cover rounded-lg"
                />
              </div>
            );
          })}
        </div>

        {/* Generate GIF Button */}
        {gifUrl ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Generated GIF:</h2>
            <img src={gifUrl} alt="Generated GIF" className="w-80 h-80 object-cover rounded-lg" />
          </div>
        ) : (
          <button
            onClick={generateGif}
            className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Create GIF"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EndScreen;
