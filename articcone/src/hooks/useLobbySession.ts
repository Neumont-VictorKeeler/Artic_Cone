import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

export default function useLobbySession() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Artic Cone Home";

        const savedLobby = localStorage.getItem("lobbyCode");
        const savedPlayer = localStorage.getItem("playerId");

        const verifyLobby = async () => {
            if (savedLobby && savedPlayer) {
                const lobbyRef = ref(db, `lobbies/${savedLobby}`);
                const snapshot = await get(lobbyRef);
                if (snapshot.exists()) {
                    if (localStorage.getItem("kicked") === "true") {
                        toast.error("You have been removed from the lobby.");
                        localStorage.removeItem("kicked");
                    } else {
                        toast.success("Rejoining your lobby...");
                        router.push(`/lobby/${savedLobby}`);
                    }
                } else {
                    localStorage.removeItem("lobbyCode");
                    localStorage.removeItem("playerId");
                    localStorage.removeItem("playerName");
                    toast.error("Your lobby no longer exists.");
                }
            }
        };

        verifyLobby();

        const syncTabs = (event: StorageEvent) => {
            if (event.key === "lobbyCode" || event.key === "playerId") {
                window.location.reload();
            }
        };

        window.addEventListener("storage", syncTabs);
        return () => window.removeEventListener("storage", syncTabs);
    }, [router]);
}