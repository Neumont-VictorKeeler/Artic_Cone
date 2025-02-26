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
        gifWidth: 400,
        gifHeight: 400
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
    return <div className="flex justify-center items-center h-screen text-lg font-semibold">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 p-6 bg-white shadow-md border-r">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Players</h2>
        <div className="space-y-3">
          {gameData.players.map((playerId: string) => (
            <div
              key={playerId}
              className={`p-3 rounded-lg cursor-pointer text-center text-lg font-medium transition ${
                selectedPlayer === playerId
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedPlayer(playerId)}
            >
              {playerId}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow p-8 items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">🎨 Drawing Chain</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg shadow-md">
            ⚠️ Failed to load real game data. Using sample data instead.
          </div>
        )}

        <div className="space-y-8 w-full max-w-2xl">
          {Object.entries(gameData.results).map(([roundName, round]: any) => {
            const playerData = selectedPlayer ? round[selectedPlayer] : null;
            if (!playerData) return null;

            return (
              <div key={roundName} className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-3 text-gray-700">{playerData.prompt}</h2>
                <img
                  src={playerData.image}
                  alt={`Image for ${playerData.prompt}`}
                  className="w-96 h-96 object-cover rounded-lg border-4 border-gray-300 shadow-md"
                />
              </div>
            );
          })}
        </div>

        {/* Generate GIF Button */}
        {gifUrl ? (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">Generated GIF:</h2>
            <img src={gifUrl} alt="Generated GIF" className="w-96 h-96 object-cover rounded-lg shadow-md" />
            <div className="mt-4">
              <a
            href={gifUrl}
            download="drawing_chain.gif"
            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
              >
            Download GIF
              </a>
            </div>
          </div>
        ) : (
          <button
            onClick={generateGif}
            className="mt-8 bg-blue-500 text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "🎥 Create GIF"}
          </button>
        )}
          </div>
        </div>
      );
    };

    export default EndScreen;
