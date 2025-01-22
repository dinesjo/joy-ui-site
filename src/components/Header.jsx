/* eslint-disable react/prop-types */
import { Stack, Divider, Box, Typography, Slider, Tooltip, Switch, Select, Button, Option } from "@mui/joy";
import ModeToggle from "./ModeToggle";
import { FaBorderAll, FaEraser, FaPencilAlt } from "react-icons/fa";
import { SLIDER_MARKS } from "../constants/config";
import { NODE_TYPES } from "../Node";

export default function Header({ gridSize, setGridSize, isErasing, setGrid, setIsErasing, resizeGrid }) {
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
  );
}
