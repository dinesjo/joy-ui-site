/* eslint-disable react/prop-types */
import { Stack, Divider, Box, Typography, Slider, Tooltip, Switch, Button, Option, ToggleButtonGroup } from "@mui/joy";
import { FaBorderAll, FaEraser, FaPencilAlt } from "react-icons/fa";
import { SLIDER_MARKS } from "../constants/config";
import { NODE_TYPES } from "../Node";
import { usePathfinder } from "../hooks/usePathfinder";

export default function Header({
  gridSize,
  setGridSize,
  isErasing,
  setGrid,
  setIsErasing,
  resizeGrid,
  grid,
  startNode,
  endNode,
  showSnackbar,
}) {
  const { visualizeAlgorithm, isVisualizing, setAlgorithm, algorithm } = usePathfinder(
    grid,
    startNode,
    endNode,
    setGrid,
    showSnackbar
  );

  function handleGridResize(newSize) {
    setGridSize(newSize);
    resizeGrid(newSize);
  }

  return (
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
          marks={SLIDER_MARKS}
          onChange={(_, newSize) => handleGridResize(newSize)}
        />
      </Box>
      <Divider orientation="vertical" />
      <Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
        <Tooltip title="Tip: Hold Shift to erase quickly">
          <Switch
            variant="solid"
            startDecorator={<FaPencilAlt />}
            endDecorator={<FaEraser />}
            onChange={() => setIsErasing((prev) => !prev)}
            checked={isErasing}
          />
        </Tooltip>
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
      </Stack>
      <Divider orientation="vertical" />
      <Stack direction="column" gap={1}>
        <ToggleButtonGroup
          value={algorithm}
          onChange={(_, value) => value && setAlgorithm(value)}
          disabled={isVisualizing}
          size="sm"
        >
          <Tooltip title="Uses cross-product heuristic">
            <Button value="dijkstra">Dijkstra&apos;s</Button>
          </Tooltip>
          <Button value="aStar">A*</Button>
        </ToggleButtonGroup>
        <Button variant="plain" color="primary" size="sm" disabled={isVisualizing} onClick={visualizeAlgorithm}>
          {isVisualizing ? "Visualizing..." : "Visualize"}
        </Button>
      </Stack>
    </Stack>
  );
}
