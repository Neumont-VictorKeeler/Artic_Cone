import { db } from "@/lib/firebase";
import { ref, get, set, push, remove } from "firebase/database";
import { toast } from "react-hot-toast";

export const joinLobby = async (lobbyCode: string, playerName: string) => {
    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    const snapshot = await get(lobbyRef);
    if (!snapshot.exists()) {
        throw new Error("Lobby does not exist!");
    }
    const playerRef = push(ref(db, `lobbies/${lobbyCode}/players`));
    const playerId = playerRef.key || "";
    await set(playerRef, { name: playerName, isHost: false });
    return playerId;
};

export const createLobby = async (lobbyCode: string, playerName: string) => {
    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    const snapshot = await get(lobbyRef);
    if (snapshot.exists()) {
        throw new Error("A lobby with this code already exists. Try again.");
    }
    const playerRef = push(ref(db, `lobbies/${lobbyCode}/players`));
    const playerId = playerRef.key || "";
    await set(ref(db, `lobbies/${lobbyCode}`), {
        players: {
            [playerId]: {
                name: playerName,
                isHost: true,
            },
        },
        gameState: "waiting",
    });
    return playerId;
};

export async function leaveLobby(code: string) {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
        toast.error("Player ID not found.");
        return;
    }
    const lobbyRef = ref(db, `lobbies/${code}`);
    const snapshot = await get(lobbyRef);
    if (snapshot.exists()) {
        const players = snapshot.val().players;
        const isHost = players[playerId]?.isHost;

        if (isHost) {
            const playerIds = Object.keys(players);
            if (playerIds.length > 1) {
                const newHostId = playerIds.find(id => id !== playerId);
                await set(ref(db, `lobbies/${code}/players/${newHostId}/isHost`), true);
            }
        }
    }

    await remove(ref(db, `lobbies/${code}/players/${playerId}`));
    localStorage.removeItem("lobbyCode");
    localStorage.removeItem("playerId");
    localStorage.removeItem("playerName");
    toast.success("You have left the lobby.");
}