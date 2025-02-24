"use client";
import React from "react";
import LobbyForm from "@/components/LobbyForm";
import useLobbySession from "@/hooks/useLobbySession";

export default function Home() {
    useLobbySession();

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            <div className="flex flex-col items-center">
                <img src="/articcone-logo.png" alt="Artic Cone Logo" className="w-full max-w-[500px] h-auto mb-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">
                    ARTIC CONE
                </h1>
            </div>
            <LobbyForm />
        </main>
    );
}
