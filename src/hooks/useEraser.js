import { useCallback, useEffect, useState } from "react";

export default function useEraser() {
  const [isErasing, setIsErasing] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Shift") {
        setIsErasing(true);
      }
    },
    [setIsErasing]
  );

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === "Shift") {
        setIsErasing(false);
      }
    },
    [setIsErasing]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { isErasing, setIsErasing };
}


