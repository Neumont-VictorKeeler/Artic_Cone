import { Server } from "socket.io";

const ioHandler = (req: any, res: any) => {
    if (!res.socket.server.io) {
        console.log("Initializing WebSocket server...");
        const io = new Server(res.socket.server);

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("join_lobby", (code) => {
                socket.join(code);
                console.log(`User joined lobby: ${code}`);
            });

            socket.on("player_update", (code, players) => {
                io.to(code).emit("update_players", players);
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
