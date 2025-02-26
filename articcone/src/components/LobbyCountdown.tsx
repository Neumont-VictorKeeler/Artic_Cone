"use client";

import React from "react";

interface LobbyCountdownProps {
    countdown: number;
}

const LobbyCountdown: React.FC<LobbyCountdownProps> = ({ countdown }) => {
    return (
        <h2 className="text-red-500 mt-2 text-center">
            Lobby will be deleted in{" "}
            <span className="font-bold">{countdown} seconds</span> unless someone joins.
        </h2>
    );
};

export default LobbyCountdown;
