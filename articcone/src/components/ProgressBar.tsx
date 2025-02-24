import { on } from "events";
import React , { useState , useEffect, useRef} from "react";

export function ProgressBar({duration, onComplete}: any) {
    const[remainingTime, setRemainingTime] = useState(duration);
    const[isRunning, setIsRunning] = useState(true);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (isRunning) {
          timerRef.current = setInterval(() => {
            setRemainingTime((prevTime: number) => {
              if (prevTime <= 0) {
                clearInterval(timerRef.current);
                onComplete?.();
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
        }
    
        return () => clearInterval(timerRef.current);
      }, [isRunning, onComplete]);
      const toggleTimer = () => {
        setIsRunning(!isRunning);
      };
      const progress = (remainingTime / duration) * 100;
      const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      };
    
      return (
        <div className="flex w-fill bg-gray-200 rounded-md mx-[13%] h-10  dark:bg-gray-700 text-center border-2 border-black">
          <div
            className="bg-blue-500 rounded-md h-full"
            style={{ width: `${progress}%` }}>
            <span className="absolute left-1/2 font-bold text-1xl ">{formatTime(remainingTime)}</span>
          </div>
        </div>
      );
      }