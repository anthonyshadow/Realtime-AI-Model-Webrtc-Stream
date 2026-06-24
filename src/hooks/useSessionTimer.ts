import { useEffect, useState } from "react";
import { formatElapsedTime } from "../lib/time";

export function useSessionTimer(isRunning: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setElapsedSeconds(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  return {
    elapsedSeconds,
    elapsedLabel: formatElapsedTime(elapsedSeconds),
  };
}
