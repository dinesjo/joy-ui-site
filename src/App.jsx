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
import { FaBorderAll, FaEraser, FaPencilAlt } from "react-icons/fa";
import { Node, NODE_TYPES } from "./Node";
import Canvas from "./Canvas";
import ToggleThemeButton from "./ToggleThemeButton";

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
  const [gridSize, setGridSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("dijkstra");

  const [grid, setGrid] = useState(JSON.parse(localStorage.getItem("grid")) || []);
  useEffect(() => {
    localStorage.setItem("grid", JSON.stringify(grid));
  }, [grid]);

  const [startNode, setStartNode] = useState(JSON.parse(localStorage.getItem("startNode")) || new Node(2, 2, "start"));
  const [endNode, setEndNode] = useState(JSON.parse(localStorage.getItem("endNode")) || new Node(7, 10, "end"));
  // When changing start/end nodes, remove the previous start/end nodes from grid
  useEffect(() => {
    setGrid((prevGrid) => {
      // Ensure the only node.type=start/end-nodes are the ones in startNode/endNode
      let newGrid = [...prevGrid];
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

  // Clear the grid and set the start and end nodes
  // useEffect(() => {
  //   let grid = [];
  //   for (let row = 0; row < gridSize; row++) {
  //     let currentRow = [];
  //     for (let col = 0; col < gridSize; col++) {
  //       currentRow.push(new Node(row, col));
  //     }
  //     grid.push(currentRow);
  //   }
  //   // Add the start and end nodes
  //   grid[startNode.row][startNode.col].type = "start";
  //   grid[endNode.row][endNode.col].type = "end";

  //   setGrid(grid);
  // }, [gridSize]);

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

  function runAlgorithm() {
    console.log("Running", selectedAlgorithm);
  }

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
            disabled
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
              if (v > max && v !== gridSize) {
                setGridSize(v);
              }
              // TODO: else: display error message to user
            }}
          />
        </Box>
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
          <Button
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
            <Option value="dijkstra" onClick={() => setSelectedAlgorithm("dijkstra")}>
              Dijsktra
            </Option>
            <Option value="aStar" onClick={() => setSelectedAlgorithm("aStar")}>
              A*
            </Option>
          </Select>
          <Button color="primary" size="sm" onClick={runAlgorithm}>
            Visualize
          </Button>
        </Stack>
        <Divider orientation="vertical" />
        <ToggleThemeButton />
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
          sideLength={Math.min(parent.innerHeight - 120, parent.innerWidth)} // navbar height
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
