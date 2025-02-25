import { Server } from "socket.io";
import { update, ref } from "firebase/database";
import { db } from "@/lib/firebase"; // Assuming you have a firebase config file

const ioHandler = (req: any, res: any) => {
    if (!res.socket.server.io) {
        console.log("Initializing WebSocket server...");
        const io = new Server(res.socket.server);

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("join_lobby", ({ code, playerId }) => {
                socket.join(code);
                console.log(`${playerId} joined lobby: ${code}`);

                // Notify others in the lobby that a player joined
                io.to(code).emit("player_joined", playerId);
            });

            socket.on("player_update", ({ code, players }) => {
                io.to(code).emit("update_players", players);
            });

            socket.on("start_game", ({ code, playerPrompts }) => {
                io.to(code).emit("start_game", { code, playerPrompts });
            });

            socket.on("update_game_state", (newGameState) => {
                const gameStateRef = ref(db, `lobbies/${newGameState.code}/game`);
                update(gameStateRef, newGameState);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
};

export default ioHandler;