let lobbies: Record<string, string[]> = {}; // Store lobbies and their players in memory

// Handle GET and POST requests
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    //
    // if (code && lobbies[code]) {
    //     return new Response(JSON.stringify(lobbies[code]), { status: 200 });
    // } else {
    //     return new Response(JSON.stringify({ error: 'Lobby not found' }), { status: 404 });
    // }
}

export async function POST(request: Request) {
    // try {
    //     const body = await request.json();
    //     const { code, playerName, action } = body;
    //
    //     if (action === "check") {
    //         // Check if a lobby exists
    //         const exists = !!lobbies[code];
    //         return new Response(JSON.stringify({ exists }), { status: 200 });
    //     }
    //
    //     if (action === "create") {
    //         // Create a new lobby if it doesn't already exist
    //         if (!lobbies[code]) {
    //             lobbies[code] = []; // Initialize lobby
    //             return new Response(JSON.stringify({ success: true }), { status: 200 });
    //         } else {
    //             return new Response(
    //                 JSON.stringify({ success: false, error: "Lobby already exists" }),
    //                 { status: 400 }
    //             );
    //         }
    //     }
    //
    //     if (action === "join") {
    //         // Add a player to an existing lobby
    //         if (lobbies[code]) {
    //             lobbies[code].push(playerName); // Add player
    //             return new Response(JSON.stringify({ success: true, players: lobbies[code] }), { status: 200 });
    //         } else {
    //             return new Response(
    //                 JSON.stringify({ success: false, error: "Lobby not found" }),
    //                 { status: 404 }
    //             );
    //         }
    //     }
    //
    //     return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
    // } catch (error) {
    //     return new Response(JSON.stringify({ error: "Invalid request format" }), { status: 400 });
    // }
}
