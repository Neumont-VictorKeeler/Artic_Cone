"use client";

import React, { useState } from "react";
const gifshot = require("gifshot");

const players = [
    {
        name: "Player 1",
        promptsAndImages: [
        { prompt: "Prompt 1", imageUrl: "/sampleImage1.jpg" },
        { prompt: "Prompt 2", imageUrl: "/sampleImage3.jpg" },
        ],
    },
    {
        name: "Player 2",
        promptsAndImages: [
        { prompt: "Prompt 3", imageUrl: "/sampleImage2.jpg" },
        { prompt: "Prompt 4", imageUrl: "/sampleImage4.png" },
        ],
    },
];

const styles = {
    container: "flex",
    menu: "w-1/4 p-4 border-r",
    menuItem: "cursor-pointer p-2 hover:bg-gray-200",
    content: "flex flex-col gap-4 w-3/4 p-4",
    section: "flex flex-col items-center",
    prompt: "text-2xl font-bold mb-2",
    image: "w-96 h-96 object-cover mb-4",
    button: "mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-700",
};

const EndScreen: React.FC = () => {
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
    const [gifUrl, setGifUrl] = useState<string | null>(null);

    const createGif = () => {
        const images = players[selectedPlayerIndex].promptsAndImages.map(
        (item) => item.imageUrl
        );

        gifshot.createGIF(
        {
            images: images,
            gifWidth: 300,
            gifHeight: 300,
            interval: 0.5,
        },
        (obj: { error: boolean; image: string }) => {
            if (!obj.error) {
            setGifUrl(obj.image);
            }
        }
        );
    };

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
            <img
            src={item.imageUrl}
            alt={`Image for ${item.prompt}`}
            className={styles.image}
            />
            </div>
            ))}
            {!gifUrl && (
            <button className={`${styles.button} transition duration-300 ease-in-out transform hover:scale-105`} onClick={createGif}>Generate GIF</button>
            )}
            {gifUrl && (
            <div className={styles.section}>
            <img src={gifUrl} alt="Generated GIF" className={styles.image} />
            </div>
            )}
        </div>
        </div>
    );
};

export default EndScreen;
