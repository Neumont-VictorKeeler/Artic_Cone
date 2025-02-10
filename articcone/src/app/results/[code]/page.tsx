'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function Results() {
    const { code } = useParams();

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Game Results: {code}</h1>
            {/* Display final drawings and scores */}
        </main>
    );
}
