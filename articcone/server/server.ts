import { Server, Socket } from "socket.io";

const activeSessions: Record<string, string> = {}; // Track active player sessions

const io = new Server({
    cors: {
        origin: "*", // Adjust this for security in production
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_lobby", ({ code, playerId, playerName }: { code: string; playerId: string; playerName: string }) => {
        if (!playerId) return;

        // Prevent multiple tabs simulating different players
        if (activeSessions[playerId]) {
            io.to(activeSessions[playerId]).emit("multiple_tabs_detected");
            io.sockets.sockets.get(activeSessions[playerId])?.disconnect();
        }

        // Store new session
        activeSessions[playerId] = socket.id;
        socket.join(code);

        console.log(`Player ${playerName} (${playerId}) joined lobby: ${code}`);
        io.to(code).emit("player_joined", { playerId, playerName });
    });

    socket.on("player_update", ({ code, players }: { code: string; players: any }) => {
        io.to(code).emit("update_players", players);
    });

    socket.on("disconnect", () => {
        const playerId = Object.keys(activeSessions).find((id) => activeSessions[id] === socket.id);
        if (playerId) {
            delete activeSessions[playerId];
        }
        console.log("User disconnected:", socket.id);
    });
});

// Start WebSocket server
const PORT = process.env.PORT || 3001;
io.listen(Number(PORT));
console.log(`WebSocket server running on port ${PORT}`);
