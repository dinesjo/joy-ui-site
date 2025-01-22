import { Sheet, useColorScheme, Snackbar } from "@mui/joy";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Header from "./components/Header";
import { useGrid } from "./hooks/useGrid";
import useEraser from "./hooks/useEraser";
import { useSnackbar } from "./hooks/useSnackbar";

export default function App() {
  // Grid size state
  const [gridSize, setGridSize] = useState(parseInt(localStorage.getItem("gridSize")) || 30);
  const { grid, setGrid, startNode, setStartNode, endNode, setEndNode, resizeGrid } = useGrid(gridSize);

  // Eraser state
  const { isErasing, setIsErasing } = useEraser();

  // Snackbar state
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  useEffect(() => {
    localStorage.setItem("gridSize", gridSize);
  }, [gridSize]);

  return (
    <>
      <Header
        gridSize={gridSize}
        setGridSize={setGridSize}
        isErasing={isErasing}
        setIsErasing={setIsErasing}
        setGrid={setGrid}
        resizeGrid={resizeGrid}
        grid={grid}
        startNode={startNode}
        endNode={endNode}
        showSnackbar={showSnackbar}
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
      <Snackbar
        variant="soft"
        color={snackbar.color}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar.message}
      </Snackbar>
    </>
  );
}
