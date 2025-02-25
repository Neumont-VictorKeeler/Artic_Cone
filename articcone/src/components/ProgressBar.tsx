import React, { useEffect, useState } from "react";

interface ProgressBarProps {
    duration: number;
    onComplete: () => void;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ duration, onComplete, className }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        const timerId = setInterval(() => {
            const now = Date.now();
            const endTime = localStorage.getItem("timerEndTime");
            if (endTime) {
                const timeRemaining = Math.max(0, parseInt(endTime) - now);
                setTimeLeft(timeRemaining);
                if (timeRemaining <= 0) {
                    clearInterval(timerId);
                    onComplete();
                }
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [onComplete]);

    return (
        <div className={`progress-bar ${className}`}>
            <div
                className="progress-bar-inner"
                style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
        </div>
    );
};