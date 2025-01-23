import { Sheet, Snackbar, Card } from "@mui/joy";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Header from "./components/Header";
import { useGrid } from "./hooks/useGrid";
import useEraser from "./hooks/useEraser";
import { useSnackbar } from "./hooks/useSnackbar";
import { usePathfinder } from "./hooks/usePathfinder";

export default function App() {
  // Grid size state
  const [gridSize, setGridSize] = useState(parseInt(localStorage.getItem("gridSize")) || 30);
  const { grid, setGrid, startNode, setStartNode, endNode, setEndNode, resizeGrid } = useGrid(gridSize);

  // Eraser state
  const { isErasing, setIsErasing } = useEraser();

  // Snackbar state
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Lift pathfinder state to App level
  const { visualizeAlgorithm, isVisualizing, setAlgorithm, algorithm, clearVisualization } = usePathfinder(
    grid,
    startNode,
    endNode,
    setGrid,
    showSnackbar
  );

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
        isVisualizing={isVisualizing}
        visualizeAlgorithm={visualizeAlgorithm}
        setAlgorithm={setAlgorithm}
        algorithm={algorithm}
      />
      <Sheet
        sx={{
          display: "grid",
          placeItems: "center",
          bgcolor: "background.body",
        }}
      >
        <Card sx={{ p: 0, overflow: "hidden", borderWidth: 3 }}>
          <Canvas
            gridSize={gridSize}
            grid={grid}
            setGrid={setGrid}
            sideLength={Math.min(parent.innerHeight - 120, parent.innerWidth)} // navbar height
            setStartNode={setStartNode}
            setEndNode={setEndNode}
            isErasing={isErasing}
            clearVisualization={clearVisualization}
          />
        </Card>
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
