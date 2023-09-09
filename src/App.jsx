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
import { FaBorderAll, FaMoon, FaSun } from "react-icons/fa";
import Node from "./Node";

const colorMap = {
  light: {
    obstacle: "#222",
    grid: "#e0e0e0",
    start: "#12467B",
    end: "#A51818",
  },
  dark: {
    obstacle: "#e0e0e0",
    grid: "#333",
    start: "#12467B",
    end: "#A51818",
  },
};

export const Canvas = (props) => {
  const {
    gridSize,
    grid,
    setGrid,
    theme,
    startNode,
    setStartNode,
    endNode,
    setEndNode,
  } = props;
  const canvasRef = useRef(null); // Reference to the canvas element
  // const [draggingNode, setDraggingNode] = useState(); // Whether the user is dragging the start/end node

  // Initialize the grid
  useEffect(() => {
    const grid = [];
    for (let row = 0; row < gridSize; row++) {
      const currentRow = [];
      for (let col = 0; col < gridSize; col++) {
        currentRow.push(new Node(col, row));
      }
      grid.push(currentRow);
    }
    // Add the start and end nodes
    grid[startNode.row][startNode.col].type = "start";
    grid[endNode.row][endNode.col].type = "end";

    setGrid(grid);
  }, [gridSize]);

  // Draw the grid and obstacles
  useEffect(() => {
    // Get the canvas context
    const canvas = canvasRef.current;
    const context = canvasRef.current.getContext("2d");
    const cellSize = context.canvas.width / gridSize;

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Set the grid color
    context.strokeStyle = colorMap[theme].grid;

    // Draw grid from the grid state
    grid.forEach((row) => {
      row.forEach((cell) => {
        const x = cell.col * cellSize;
        const y = cell.row * cellSize;
        context.strokeRect(x, y, cellSize, cellSize); // Draw the cell
        if (cell.type === "obstacle") {
          // Draw the obstacle
          context.fillStyle = colorMap[theme].obstacle;
          context.fillRect(x, y, cellSize, cellSize);
        }
        if (cell.type === "start") {
          // Draw the start node
          context.fillStyle = colorMap[theme].start;
          context.fillRect(x, y, cellSize, cellSize);
        }
        if (cell.type === "end") {
          // Draw the end node
          context.fillStyle = colorMap[theme].end;
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
    const cellSize = canvas.width / gridSize;
    // Calculate the cell coordinates where the user clicked
    const row = Math.floor(e.offsetY / cellSize);
    const col = Math.floor(e.offsetX / cellSize);

    // Check if the cell is empty
    const cell = grid[row][col];
    if (cell.type === "empty") {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row][col] = { ...cell, type: "obstacle" };
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
  // Initialize the grid size from local storage
  const [gridSize, setGridSize] = useState(
    parseInt(localStorage.getItem("gridSize")) || defGridSize
  );
  useEffect(() => {
    localStorage.setItem("gridSize", gridSize);
  }, [gridSize]);
  // Initialize the grid
  const [grid, setGrid] = useState([]); // Initialize as an empty grid
  // Initialize start/end nodes
  const [startNode, setStartNode] = useState(new Node(0, 0, "start"));
  const [endNode, setEndNode] = useState(new Node(10, 10, "end"));

  return (
    <>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={6}
        sx={{ width: "100vw", px: 2, py: 2.5 }}
      >
        <Box sx={{ width: 250 }}>
          <Typography
            startDecorator={<FaBorderAll />}
            sx={{ textAlign: "center" }}
          >
            Grid Size [{gridSize}x{gridSize}]
          </Typography>
          <Slider
            valueLabelDisplay="auto"
            defaultValue={gridSize}
            step={10}
            min={20}
            max={100}
            marks={sliderMarks}
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
                  if (cell.type === "obstacle") {
                    cell.type = "empty";
                  }
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
          startNode={startNode}
          setStartNode={setStartNode}
          endNode={endNode}
          setEndNode={setEndNode}
        />
      </Sheet>
    </>
  );
}

export default App;
