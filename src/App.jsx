import {
  Box,
  Button,
  Sheet,
  Slider,
  Stack,
  Typography,
  useColorScheme,
} from "@mui/joy";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

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
  const { gridSize, obstacles, setObstacles, theme } = props;
  const canvasRef = useRef(null); // Reference to the canvas element

  useEffect(() => {
    // Get the canvas context
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Draw grid and obstacles
    context.strokeStyle = colorMap[theme].grid;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellSize = canvas.width / gridSize;
        const x = col * cellSize;
        const y = row * cellSize;
        context.strokeRect(x, y, cellSize, cellSize);

        if (
          obstacles.some((obstacle) => obstacle.x === col && obstacle.y === row)
        ) {
          context.fillStyle = colorMap[theme].obstacle;
          context.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
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
  }, [gridSize, obstacles, theme]); // Re-render canvas upon changes

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    // Calculate the cell coordinates where the user clicked
    const cellSize = canvas.width / gridSize;
    const col = Math.floor(e.offsetX / cellSize);
    const row = Math.floor(e.offsetY / cellSize);

    // Check if the cell is not already an obstacle
    if (
      !obstacles.some((obstacle) => obstacle.x === col && obstacle.y === row)
    ) {
      setObstacles([...obstacles, { x: col, y: row }]);
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
  const [mounted, setMounted] = React.useState(false);

  // necessary for server-side rendering
  // because mode is undefined on the server
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="soft"
      onClick={() => {
        setMode(mode === "light" ? "dark" : "light");
      }}
    >
      {mode === "light" ? "Turn dark" : "Turn light"}
    </Button>
  );
}

const marks = [
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
  const [gridSize, setGridSize] = React.useState(defGridSize);
  const [obstacles, setObstacles] = useState([]);

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
            defaultValue={defGridSize}
            step={10}
            min={20}
            max={100}
            marks={marks}
            sx={{ mx: 4 }}
            onChange={(e, v) => {
              setGridSize(v);
            }}
          />
        </Box>
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
          obstacles={obstacles}
          setObstacles={setObstacles}
          width={parent.innerWidth}
          height={parent.innerHeight - 120}
          theme={useColorScheme().mode}
        />
      </Sheet>
    </>
  );
}

export default App;
