"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Redirect back to the home after 3 seconds.
        const timer = setTimeout(() => {
            router.push("/");
        }, 0);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-300 via-green-900 to-blue-300 text-foreground">
            {/*<h1 className="text-4xl font-bold bg-gradient-to-b from-white to-blue-300 bg-clip-text text-transparent">*/}
            {/*    PAGE NOT FOUND!*/}
            {/*</h1>*/}
        </div>
    );
}
 