/* Marker and Session Types */

export interface MarkerBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    corners?: { x: number; y: number }[] /* Actual quadrilateral vertices */;
}

export interface DetectedMarker {
    id: string;
    uri: string /* path to the 300x300 extracted PNG */;
    timestamp: number /* epoch ms */;
    frameIndex: number /* 0 based index within the session */;
    confidence: number /* confidence score */;
    orientation: number /* degrees after perspective correction */;
    width: number /* marker output size */;
    height: number /* marker output size */;
}

export interface ScanSession {
    id: string;
    startedAt: number;
    completedAt: number | null;
    markers: DetectedMarker[];
    totalFramesScanned: number;
}

export type ScanStatus =
    | 'idle'
    | 'scanning'
    | 'processing'
    | 'complete'
    | 'error';

/* Navigation */

export type RootStackParamList = {
    Camera: undefined;
    Results: undefined;
    History: undefined;
};

/* Stat item for StatsRow */

export interface StatItem {
    label: string;
    value: string | number;
}

/* OpenCV shim types */

export interface CaptureResult {
    uri: string;
    width?: number;
    height?: number;
}
