import {
  Box,
  Button,
  Sheet,
  Slider,
  Stack,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { FaBorderAll, FaMoon, FaSun } from "react-icons/fa";
import Node from "./Node";
import Canvas from "./Canvas";

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

function App() {
  // Initialize the grid size from local storage
  const [gridSize, setGridSize] = useState(
    parseInt(localStorage.getItem("gridSize")) || 20
  );
  useEffect(() => {
    localStorage.setItem("gridSize", gridSize);
  }, [gridSize]);
  // Initialize the grid
  const [grid, setGrid] = useState([]); // Initialize as an empty grid
  // Initialize start/end nodes
  const [startNode, setStartNode] = useState(new Node(3, 3, "start"));
  const [endNode, setEndNode] = useState(new Node(16, 16, "end"));

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
                row.forEach((node) => {
                  if (node.type === "obstacle") {
                    node.type = "empty";
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
          width={parent.innerHeight - 120}
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
