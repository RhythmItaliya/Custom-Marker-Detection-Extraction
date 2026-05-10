/* Assignment specified constants */

/** Number of marker frames to collect per session. */
export const MAX_MARKERS = 20;

/** Every extracted marker is resized to this square in pixels. */
export const MARKER_OUTPUT_SIZE = 300;

/** Camera capture resolution — must be 2000–3000 px per spec. */
export const CAMERA_RESOLUTION = 2000;

/** Interval between successive capture attempts while scanning (ms). */
export const SCAN_INTERVAL_MS = 120; /* ~8.3 captures per sec to meet <3s spec */

/* Detection tuning */

/** Allowed deviation from 1:1 aspect ratio to still count as "square". */
export const ASPECT_RATIO_TOLERANCE = 0.25;

/** Contour must occupy at least this fraction of total image area. */
export const MIN_AREA_FRACTION = 0.005;

/** Contour must not exceed this fraction of total image area. */
export const MAX_AREA_FRACTION = 0.7;

/** Minimum solidity (area / convex-hull area) for a clean square shape. */
export const MIN_SOLIDITY = 0.8;

export * from './theme';

/* Grid layout */

export const GRID_COLUMNS = 4;
export const GRID_GAP = 8;
export const GRID_PADDING = 24;
