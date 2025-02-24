"use client";

import { useEffect } from "react";
import { ref, get, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

interface LobbyData {
    players?: Record<string, unknown>;
}

const PurgeLobbies = () => {
    useEffect(() => {
        const purgeLobbies = async () => {
            try {
                const lobbiesRef = ref(db, "lobbies");
                const snapshot = await get(lobbiesRef);
                if (snapshot.exists()) {
                    // Cast the data to a record of LobbyData objects
                    const lobbies = snapshot.val() as Record<string, LobbyData>;
                    // Iterate over each lobby entry
                    for (const [lobbyId, lobbyData] of Object.entries(lobbies)) {
                        // Purge lobbies that have 1 or fewer players.
                        if (lobbyData && lobbyData.players) {
                            const players = Object.keys(lobbyData.players);
                            if (players.length <= 1) {
                                await remove(ref(db, `lobbies/${lobbyId}`));
                                toast.success(`Deleted lobby ${lobbyId} due to inactivity.`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error purging lobbies:", error);
                toast.error("Error purging lobbies.");
            }
        };

        purgeLobbies();
    }, []);

    return null; // This component doesn't render anything visible
};

export default PurgeLobbies;
