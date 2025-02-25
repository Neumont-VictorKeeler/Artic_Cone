"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { joinLobby, createLobby } from "@/lib/lobbyService";

const generateLobbyCode = (length = 6) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const LobbyForm = () => {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [error, setError] = useState("");

    const handleJoin = async () => {
        if (!playerName.trim() || !lobbyCode.trim()) {
            setError("Please enter a lobby code and your name.");
            return;
        }
        try {
            const playerId = await joinLobby(lobbyCode, playerName);
            localStorage.setItem("playerId", playerId);
            localStorage.setItem("playerName", playerName);
            localStorage.setItem("lobbyCode", lobbyCode);
            localStorage.setItem("syncUpdate", Date.now().toString());

            socket.emit("join_lobby", { code: lobbyCode, playerId, playerName });
            router.push(`/lobby/${lobbyCode}`);
        } catch (err: any) {
            setError(err.message || "Error checking lobby.");
        }
    };

    const handleCreate = async () => {
        if (!playerName.trim()) {
            setError("Please enter your name.");
            return;
        }
        const customCode = lobbyCode.trim() || generateLobbyCode();
        try {
            const playerId = await createLobby(customCode, playerName);
            localStorage.setItem("playerId", playerId);
            localStorage.setItem("playerName", playerName);
            localStorage.setItem("lobbyCode", customCode);
            localStorage.setItem("syncUpdate", Date.now().toString());

            socket.emit("create_lobby", { code: customCode, hostId: playerId, hostName: playerName });
            toast.success(`Lobby Created: ${customCode}`);
            router.push(`/lobby/${customCode}`);
        } catch (err: any) {
            setError(err.message || "Error creating lobby.");
        }
    };

    return (
        <div className="mt-8 flex flex-col items-center space-y-4">
            <Input
                type="text"
                placeholder="Enter Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="text-center bg-gradient-to-b from-white to-blue-100 shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
            />
            <Input
                type="text"
                placeholder="Enter Lobby Code"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="text-center bg-gradient-to-b from-white to-blue-100 shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="flex space-x-4">
                <Button variant="default" onClick={handleJoin}>
                    Join Lobby
                </Button>
                <Button variant="creative" onClick={handleCreate}>
                    Create Lobby
                </Button>
            </div>
        </div>
    );
};

export default LobbyForm;
