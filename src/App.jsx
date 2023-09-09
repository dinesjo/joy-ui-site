import {
  Box,
  Button,
  Sheet,
  Slider,
  Stack,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const colorMap = {
  light: {
    obstacle: "#222",
    grid: "#e0e0e0",
  },
  dark: {
    obstacle: "#e0e0e0",
    grid: "#424242",
  },
};

export const Canvas = (props) => {
  const { gridSize, grid, setGrid, theme } = props;
  const canvasRef = useRef(null); // Reference to the canvas element

  // Initialize the grid
  useEffect(() => {
    const grid = [];
    for (let row = 0; row < gridSize; row++) {
      const currentRow = [];
      for (let col = 0; col < gridSize; col++) {
        currentRow.push({
          x: col,
          y: row,
          isObstacle: false,
          animationFrame: 0,
        });
      }
      grid.push(currentRow);
    }
    setGrid(grid);
  }, [gridSize]);

  // Draw the grid and obstacles
  useEffect(() => {
    // Get the canvas context
    const canvas = canvasRef.current;
    const context = canvasRef.current.getContext("2d");

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Set the grid color
    context.strokeStyle = colorMap[theme].grid;

    // Draw grid from the grid state
    grid.forEach((row) => {
      row.forEach((cell) => {
        const cellSize = context.canvas.width / gridSize;
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;
        context.strokeRect(x, y, cellSize, cellSize);
        if (cell.isObstacle) {
          context.fillStyle = colorMap[theme].obstacle;
          context.fillRect(x, y, cellSize, cellSize);
        }
      });
    });

    // Draw obstacles
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [grid, theme]); // Re-render canvas upon changes

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    // Calculate the cell coordinates where the user clicked
    const cellSize = canvas.width / gridSize;
    const row = Math.floor(e.offsetY / cellSize);
    const col = Math.floor(e.offsetX / cellSize);

    // Check if the cell is not already an obstacle
    const cell = grid[row][col];
    if (!cell.isObstacle) {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row][col] = { ...cell, isObstacle: true };
        return newGrid;
      });
    }
  };

  const handleMouseMove = (e) => {
    // If the mouse button is pressed, draw obstacles while moving
    if (e.buttons === 1) {
      handleMouseDown(e);
    }
  };

  const handleMouseUp = () => {
    // Do any cleanup if needed
  };

  return <canvas ref={canvasRef} width={props.width} height={props.height} />;
};

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  // necessary for server-side rendering
  // because mode is undefined on the server
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="soft"
      color="neutral"
      onClick={() => {
        setMode(mode === "light" ? "dark" : "light");
      }}
    >
      {mode === "light" ? <FaMoon /> : <FaSun />}
    </Button>
  );
}

const sliderMarks = [
  {
    value: 20,
    label: "20",
  },
  {
    value: 40,
    label: "40",
  },
  {
    value: 60,
    label: "60",
  },
  {
    value: 80,
    label: "80",
  },
  {
    value: 100,
    label: "100",
  },
];

const defGridSize = 20;
function App() {
  const [gridSize, setGridSize] = useState(
    parseInt(localStorage.getItem("gridSize")) || defGridSize
  );
  useEffect(() => {
    localStorage.setItem("gridSize", gridSize);
  }, [gridSize]);
  const [grid, setGrid] = useState([]); // Initialize as an empty grid

  return (
    <>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={10}
        sx={{ width: "100vw", px: 2, py: 2.5 }}
      >
        <Box sx={{ width: 250 }}>
          <Typography sx={{ textAlign: "center" }}>
            Grid Size [{gridSize}x{gridSize}]
          </Typography>
          <Slider
            valueLabelDisplay="auto"
            defaultValue={gridSize}
            step={10}
            min={20}
            max={100}
            marks={sliderMarks}
            sx={{ mx: 4 }}
            onChange={(e, v) => {
              setGridSize(v);
            }}
          />
        </Box>
        <Button
          variant="soft"
          color="danger"
          onClick={() =>
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              newGrid.forEach((row) => {
                row.forEach((cell) => {
                  cell.isObstacle = false;
                });
              });
              return newGrid;
            })
          }
        >
          Clear Obstacles
        </Button>
        <ModeToggle />
      </Stack>
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
          width={parent.innerWidth}
          height={parent.innerHeight - 120}
          theme={useColorScheme().mode}
        />
      </Sheet>
    </>
  );
}

export default App;
