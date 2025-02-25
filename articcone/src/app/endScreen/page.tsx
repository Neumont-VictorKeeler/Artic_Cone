"use client";

import React, { useState } from 'react';

const players = [
    { name: 'Player 1', promptsAndImages: [{ prompt: 'Prompt 1', imageUrl: 'image1.jpg' }, { prompt: 'Prompt 2', imageUrl: 'image2.jpg' }] },
    { name: 'Player 2', promptsAndImages: [{ prompt: 'Prompt 3', imageUrl: 'image3.jpg' }, { prompt: 'Prompt 4', imageUrl: 'image4.jpg' }] },
    // Add more players and their prompts and images as needed
];

const styles = {
    container: 'flex',
    menu: 'w-1/4 p-4 border-r',
    menuItem: 'cursor-pointer p-2 hover:bg-gray-200',
    content: 'flex flex-col gap-4 w-3/4 p-4',
    section: 'flex flex-col items-center',
    prompt: 'text-2xl font-bold mb-2',
    image: 'w-96 h-96 object-cover mb-4',
};

const EndScreen: React.FC = () => {
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);

    return (
        <div className={styles.container}>
            <div className={styles.menu}>
                {players.map((player, index) => (
                    <div
                        key={index}
                        className={styles.menuItem}
                        onClick={() => setSelectedPlayerIndex(index)}
                    >
                        {player.name}
                    </div>
                ))}
            </div>
            <div className={styles.content}>
                {players[selectedPlayerIndex].promptsAndImages.map((item, index) => (
                    <div key={index} className={styles.section}>
                        <h2 className={styles.prompt}>{item.prompt}</h2>
                        <img src={item.imageUrl} alt={`Image for ${item.prompt}`} className={styles.image} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EndScreen;