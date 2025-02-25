import { useEffect } from "react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";

export default function useGameStart() {
    const router = useRouter();

    useEffect(() => {
        const handleGameStart = ({ code }: { code: string }) => {
            router.push(`/gamePage/${code}`);
        };

        socket.on("start_game", handleGameStart);

        return () => {
            socket.off("start_game", handleGameStart);
        };
    }, [router]);
}