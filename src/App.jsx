import {
  Box,
  Button,
  Divider,
  Option,
  Select,
  Sheet,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useCallback, useEffect, useState } from "react";
import { FaBorderAll, FaEraser, FaMoon, FaPencilAlt, FaSun } from "react-icons/fa";
import { Node, NODE_TYPES } from "./Node";
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
    <Tooltip title={mode === "light" ? "Dark Mode" : "Light Mode"} variant="soft">
      <Button
        variant="plain"
        color="neutral"
        onClick={() => {
          setMode(mode === "light" ? "dark" : "light");
        }}
      >
        {mode === "light" ? <FaMoon /> : <FaSun />}
      </Button>
    </Tooltip>
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

export default function App() {
  // Initialize the grid size from local storage
  const [gridSize, setGridSize] = useState(parseInt(localStorage.getItem("gridSize")) || 30);
  useEffect(() => {
    localStorage.setItem("gridSize", gridSize);
  }, [gridSize]);

  const [isErasing, setIsErasing] = useState(false);
  const [grid, setGrid] = useState([]); // Initialize as an empty grid

  const [startNode, setStartNode] = useState(JSON.parse(localStorage.getItem("startNode")) || new Node(2, 2, "start"));
  const [endNode, setEndNode] = useState(JSON.parse(localStorage.getItem("endNode")) || new Node(7, 10, "end"));
  // When changing start/end nodes, remove the previous start/end nodes from grid
  useEffect(() => {
    setGrid((prevGrid) => {
      // Ensure the only node.type=start/end-nodes are the ones in startNode/endNode
      const newGrid = [...prevGrid];
      newGrid.forEach((row) => {
        row.forEach((node) => {
          if (node.type === "start") {
            node.type = "empty";
          } else if (node.type === "end") {
            node.type = "empty";
          }
        });
      });
      newGrid[startNode.row][startNode.col].type = "start";
      newGrid[endNode.row][endNode.col].type = "end";
      return newGrid;
    });

    // Update in local storage
    localStorage.setItem("startNode", JSON.stringify(startNode));
    localStorage.setItem("endNode", JSON.stringify(endNode));
  }, [startNode, endNode]);

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
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={6}
        sx={{ width: "100vw", px: 2, py: 2.5 }}
      >
        <Box sx={{ width: 250 }}>
          <Typography startDecorator={<FaBorderAll />}>
            Grid Size [{gridSize}x{gridSize}]
          </Typography>
          <Slider
            valueLabelDisplay="auto"
            defaultValue={20}
            value={gridSize}
            step={10}
            min={20}
            max={100}
            marks={sliderMarks}
            onChange={(_, v) => {
              // Don't allow grid size to exceed start/end node positions
              const max = Math.max(startNode.row, startNode.col, endNode.row, endNode.col);
              if (v > max) {
                // TODO: display error message to user
                setGridSize(v);
              }
            }}
          />
        </Box>
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
          <Button
            variant="plain"
            color="danger"
            onClick={() =>
              setGrid((prevGrid) => {
                const newGrid = [...prevGrid];
                newGrid.forEach((row) => {
                  row.forEach((node) => {
                    if (node.type === NODE_TYPES.OBSTACLE) {
                      node.type = "empty";
                    }
                  });
                });
                return newGrid;
              })
            }
          >
            Clear All Obstacles
          </Button>
          <Tooltip title="Tip: Hold Shift to erase quickly">
            <Switch
              variant="solid"
              startDecorator={<FaPencilAlt />}
              endDecorator={<FaEraser />}
              onChange={() => setIsErasing((prev) => !prev)}
              checked={isErasing}
            />
          </Tooltip>
        </Stack>
        <Divider orientation="vertical" />
        <Stack direction="column" gap={1}>
          <Select defaultValue="dijkstra">
            <Option value="dijkstra">Dijkstra</Option>
            <Option value="aStar">A*</Option>
          </Select>
          <Button variant="plain" color="primary" size="sm">
            Visualize
          </Button>
        </Stack>
        <Divider orientation="vertical" />
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
          sideLength={parent.innerHeight - 120} // navbar height
          theme={useColorScheme().mode}
          startNode={startNode}
          setStartNode={setStartNode}
          endNode={endNode}
          setEndNode={setEndNode}
          isErasing={isErasing}
        />
      </Sheet>
    </>
  );
}
