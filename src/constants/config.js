export const GRID_CONFIG = {
  DEFAULT_SIZE: 30,
  MIN_SIZE: 20,
  MAX_SIZE: 100,
  STEP: 10
};

export const SLIDER_MARKS = [
  { value: 20, label: "20" },
  { value: 40, label: "40" },
  { value: 60, label: "60" },
  { value: 80, label: "80" },
  { value: 100, label: "100" }
];

export const START_NODE = { row: 2, col: 2 };
export const END_NODE = { row: 7, col: 10 };

export const CROSS_PRODUCT_WEIGHT = 0.001; // Weight for the cross product in the alignment score