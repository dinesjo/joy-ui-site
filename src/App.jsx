import { Sheet, useColorScheme } from "@mui/joy";
import { useCallback, useEffect, useState } from "react";
import Canvas from "./Canvas";
import Header from "./components/Header";
import { useGrid } from "./hooks/useGrid";

export default function App() {
  const [gridSize, setGridSize] = useState(parseInt(localStorage.getItem("gridSize")) || 30);
  const [isErasing, setIsErasing] = useState(false);

  const { grid, setGrid, startNode, setStartNode, endNode, setEndNode, resizeGrid } = useGrid(gridSize);
  useEffect(() => {
    localStorage.setItem("gridSize", gridSize);
  }, [gridSize]);

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

  return (
    <>
      <Header
        gridSize={gridSize}
        setGridSize={setGridSize}
        isErasing={isErasing}
        setIsErasing={setIsErasing}
        setGrid={setGrid}
        startNode={startNode}
        endNode={endNode}
        resizeGrid={resizeGrid}
      />
      <Sheet
        sx={{
          display: "grid",
          placeItems: "center",
        }}
      >
        <Canvas
          gridSize={gridSize}
          grid={grid}
          setGrid={setGrid}
          sideLength={Math.min(parent.innerHeight - 120, parent.innerWidth)} // navbar height
          theme={useColorScheme().mode}
          setStartNode={setStartNode}
          setEndNode={setEndNode}
          isErasing={isErasing}
        />
      </Sheet>
    </>
  );
}
