// articcone/src/components/LobbyControls.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface LobbyControlsProps {
    isHost: boolean;
    onStartGame: () => void;
    onDeleteLobby: () => void;
    onLeaveLobby: () => void; // Add this prop
}

const LobbyControls: React.FC<LobbyControlsProps> = ({ isHost, onStartGame, onDeleteLobby, onLeaveLobby }) => {
    return (
        <div className="flex space-x-4 mt-4">
            {isHost ? (
                <>
                    <Button variant="creative" onClick={onStartGame}>
                        Start Game
                    </Button>
                    
                    <Button variant="destructive" onClick={onDeleteLobby}>
                        Delete Lobby
                    </Button>
                </>
            ) : (
                <Button variant="destructive" onClick={onLeaveLobby}>
                    Leave Lobby
                </Button>
            )}
        </div>
    );
};

export default LobbyControls;