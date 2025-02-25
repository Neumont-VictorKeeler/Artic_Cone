import { db } from "@/lib/firebase";
import { ref, get, set, push } from "firebase/database";

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
