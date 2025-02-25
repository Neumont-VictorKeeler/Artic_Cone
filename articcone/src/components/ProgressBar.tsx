import React, { useEffect, useState } from "react";

export function ProgressBar({ duration, onComplete }: any) {
    const [remainingTime, setRemainingTime] = useState(duration); 

    useEffect(() => {
        if (remainingTime <= 0) {
            onComplete();
            return;
        }

        const interval = setInterval(() => {
            setRemainingTime((prevTime: number) => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingTime, onComplete]);
    const progress = (remainingTime / duration) * 100;
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="flex justify-center items-center  w-full ">
          <div className="flex w-3/4 bg-gray-200 h-6 rounded-full overflow-hidden border-2 border-black items-center"> 
            <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${progress}%` }}
            />
            <div className="absolute right-1/2 flex items-center self-center ">
                {formatTime(remainingTime)}
            </div>
        </div>
        </div>
    );
}