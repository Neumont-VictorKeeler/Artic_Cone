"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Redirect back to the lobby after 3 seconds
        const timer = setTimeout(() => {
            router.push("/");
        }, 0);
        return () => clearTimeout(timer);
    }, [router]);

    // return (
    //     <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
    //         <h1 className="text-3xl font-bold">Lobby Not Found</h1>
    //         <p className="mt-4 text-lg">Redirecting you back to the home page...</p>
    //     </div>
    // );
}
