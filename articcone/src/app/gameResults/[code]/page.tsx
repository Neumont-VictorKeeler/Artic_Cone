"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import EndScreen from "@/components/Endscreen";

const GameResultsPage = () => {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const router = useRouter();

    useEffect(() => {
        if (!code) return;
        const gameRef = ref(db, `lobbies/${code}/game`);
        const unsub = onValue(gameRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast.error("Game not found or deleted.");
                router.push("/");
                return;
            }
        });
        return () => unsub();
    }, [code, router]);

    return code ? <EndScreen code={code} /> : <div className="flex items-center justify-center h-screen">
        <p>Loading...</p></div>;
};

export default GameResultsPage;
