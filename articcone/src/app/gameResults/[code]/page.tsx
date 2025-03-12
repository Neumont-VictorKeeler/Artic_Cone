"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import EndScreen from "@/components/Endscreen";

const GameResultsPage = () => {
    const { code } = useParams();
    const gameCode = Array.isArray(code) ? code[0] : code;
    const router = useRouter();
    const [gameExists, setGameExists] = useState(false);

    useEffect(() => {
        if (!gameCode) return;
        const gameRef = ref(db, `lobbies/${gameCode}/game`);
        const unsub = onValue(gameRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast.error("Game not found or deleted.");
                router.push("/");
                return;
            }
            setGameExists(true);
        });
        return () => unsub();
    }, [gameCode, router]);

    if (!gameCode || !gameExists) {
        return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
    }

    return <EndScreen code={gameCode} />;
};

export default GameResultsPage;