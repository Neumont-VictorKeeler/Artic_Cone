let lobbies: Record<string, string[]> = {};

function generateLobbyCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code && lobbies[code]) {
        return new Response(JSON.stringify({ exists: true, players: lobbies[code] }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ exists: false, error: 'Lobby not found' }), { status: 404 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { playerName, action } = body;

        if (action === "create") {
            const code = generateLobbyCode();
            lobbies[code] = [];
            return new Response(JSON.stringify({ success: true, code }), { status: 200 });
        }

        if (action === "join") {
            const code = body.code;
            if (lobbies[code]) {
                if (!lobbies[code].includes(playerName)) {
                    lobbies[code].push(playerName);
                }
                return new Response(JSON.stringify({ success: true, players: lobbies[code] }), { status: 200 });
            } else {
                return new Response(JSON.stringify({ success: false, error: "Lobby not found" }), { status: 404 });
            }
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request format" }), { status: 400 });
    }
}
