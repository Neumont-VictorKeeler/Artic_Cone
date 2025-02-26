// gameUtils.ts
import { ref, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import socket from "@/lib/socket";
import { Player } from "@/hooks/useLobby";


type PlayerResults = {
    [playerId: string]: {
        chain: Array<{ prompt: string; image: string }>;
    };
};

type Game = {
    round: number;
    totalRounds: number;
    phase: string;
    players: Player[];
    results: {
        [playerId: string]: {
            chain: Array<{ prompt: string; image: string }>;
        };
    };
};

export async function initializeGame(code: string, players: Player[]) {
    // Get a list of prompts from the database
    const promptsRef = ref(db, "prompts");
    const snapshot = await get(promptsRef);
    const prompts = snapshot.val();

    if (!prompts) {
        throw new Error("No prompts available in the database.");
    }

    // Shuffle and assign prompts
    const promptList = Object.values(prompts);
    const shuffledPrompts = promptList.sort(() => 0.5 - Math.random());

    // Prepare players array
    const updatedPlayers = players.map((player) => ({
        ...player,
        locked: false,
    }));

    // Seed the initial results for round 1
    const results: PlayerResults = {};
    updatedPlayers.forEach((player, index) => {
        const initialPrompt = shuffledPrompts[index % shuffledPrompts.length] as string;
        results[`player_${player.id}`] = {
            chain: [{ prompt: initialPrompt, image: "" }],
        };
    });

    const totalRounds = players.length;

    // Update the game node with all the info
    await update(ref(db, `lobbies/${code}/game`), {
        round: 1,
        totalRounds,
        phase: "drawing",
        players: updatedPlayers,
        results,
        timer: Date.now() + 60000,
        lockedCount: 0,
    });

    // Mark the game as started
    await update(ref(db, `lobbies/${code}`), {
        gameState: "started",
    });

    socket.emit("start_game", { code });
}

export async function handleDrawingSubmission(code: string, game: Game, playerId: string, imageData: string) {
    const updatedPlayers = game.players.map((p: Player) =>
        p.id === playerId ? { ...p, locked: true } : p
    );
    const lockedCount = updatedPlayers.filter((p: Player) => p.locked).length;

    const playerKey = `player_${playerId}`;

    const currentResult = game.results?.[playerKey]?.chain || [];
    currentResult[game.round - 1].image = imageData;

    await update(ref(db, `lobbies/${code}/game/results/${playerKey}/chain`), currentResult);
    await update(ref(db, `lobbies/${code}/game`), { lockedCount });

    if (lockedCount === game.players.length) {
        handleRoundComplete(code, game);
    }
}

export async function handlePromptSubmission(code: string, game: Game, playerId: string, promptValue: string) {
    const updatedPlayers = game.players.map((p: Player) =>
        p.id === playerId ? { ...p, locked: true } : p
    );
    const lockedCount = updatedPlayers.filter((p: Player) => p.locked).length;

    const playerKey = `player_${playerId}`;

    const currentResult = game.results?.[playerKey]?.chain || [];
    currentResult.push({ prompt: promptValue, image: "" });

    await update(ref(db, `lobbies/${code}/game/results/${playerKey}/chain`), currentResult);
    await update(ref(db, `lobbies/${code}/game`), { lockedCount });

    if (lockedCount === game.players.length) {
        handleRoundComplete(code, game);
    }
}

export async function handleRoundComplete(code: string, game: Game) {
    const { round, totalRounds, phase, players } = game;

    let nextPhase = phase;
    let nextRound = round;
    if (phase === "drawing") {
        nextPhase = "guessing";
    } else if (phase === "guessing") {
        nextRound = round + 1;
        if (nextRound > totalRounds) {
            nextPhase = "complete";
        } else {
            nextPhase = "drawing";
        }
    }

    const updatedPlayers = players.map((p: Player) => ({ ...p, locked: false }));

    await update(ref(db, `lobbies/${code}/game`), {
        round: nextRound,
        phase: nextPhase,
        players: updatedPlayers,
        timer: Date.now() + 60000,
        lockedCount: 0,
    });

    socket.emit("update_game_state", {
        code,
        round: nextRound,
        phase: nextPhase,
        players: updatedPlayers,
    });
}