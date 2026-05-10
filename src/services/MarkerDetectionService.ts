/* High performance marker detection service using OpenCV */
import {
    OpenCV,
    ObjectType,
    DataTypes,
    ColorConversionCodes,
    ThresholdTypes,
    AdaptiveThresholdTypes,
    RetrievalModes,
    ContourApproximationModes,
    DecompTypes,
    InterpolationFlags,
    BorderTypes,
    RotateFlags,
} from 'react-native-fast-opencv';
import type {
    Mat,
    PointVectorOfVectors,
    PointVector,
    Size,
    Scalar,
} from 'react-native-fast-opencv';
import RNFS from 'react-native-fs';
import { DetectedMarker, MarkerBounds } from '@/types';
import {
    MARKER_OUTPUT_SIZE,
    ASPECT_RATIO_TOLERANCE,
    MIN_AREA_FRACTION,
    MAX_AREA_FRACTION,
} from '@/constants/appConstants';

interface DetectResult {
    bounds: MarkerBounds;
    base64: string;
}

export class MarkerDetectionService {
    /* Primary detection pipeline using base64 image data */
    static async detectWithBase64(
        imageUri: string,
    ): Promise<DetectResult | null> {
        let src: Mat | null = null;
        let gray: Mat | null = null;
        let blurred: Mat | null = null;
        let thresh: Mat | null = null;
        let contours: PointVectorOfVectors | null = null;
        let ksize: Size | null = null;

        try {
            const base64 = await RNFS.readFile(imageUri, 'base64');
            if (!base64) return null;

            src = OpenCV.base64ToMat(base64);
            if (!src) return null;

            const { cols, rows } = OpenCV.toJSValue(src);
            const imageArea = cols * rows;

            /* 1. Grayscale */
            gray = OpenCV.createObject(
                ObjectType.Mat,
                rows,
                cols,
                DataTypes.CV_8UC1,
            );
            OpenCV.invoke(
                'cvtColor',
                src,
                gray,
                ColorConversionCodes.COLOR_BGR2GRAY,
            );

            /* Preprocessing: Blur and Adaptive Threshold */
            blurred = OpenCV.createObject(
                ObjectType.Mat,
                rows,
                cols,
                DataTypes.CV_8UC1,
            );
            ksize = OpenCV.createObject(ObjectType.Size, 5, 5);
            OpenCV.invoke('GaussianBlur', gray, blurred, ksize, 0);

            thresh = OpenCV.createObject(
                ObjectType.Mat,
                rows,
                cols,
                DataTypes.CV_8UC1,
            );
            OpenCV.invoke(
                'adaptiveThreshold',
                blurred,
                thresh,
                255,
                AdaptiveThresholdTypes.ADAPTIVE_THRESH_GAUSSIAN_C,
                ThresholdTypes.THRESH_BINARY_INV,
                11,
                2,
            );

            /* Contour detection */
            contours = OpenCV.createObject(ObjectType.PointVectorOfVectors);
            OpenCV.invoke(
                'findContours',
                thresh,
                contours,
                RetrievalModes.RETR_EXTERNAL,
                ContourApproximationModes.CHAIN_APPROX_SIMPLE,
            );

            const bounds = MarkerDetectionService._bestCandidate(
                contours,
                imageArea,
                cols,
                rows,
            );

            if (__DEV__) {
                const { array } = OpenCV.toJSValue(contours);
                console.log(
                    '[Detection] contours found:',
                    array.length,
                    '| best:',
                    bounds,
                );
            }

            if (!bounds) return null;
            return { bounds, base64 };
        } catch (err) {
            if (__DEV__) console.warn('[Detection] error:', err);
            return null;
        } finally {
            if (contours) OpenCV.clearBuffers([contours.id]);
            if (thresh) OpenCV.clearBuffers([thresh.id]);
            if (ksize) OpenCV.clearBuffers([ksize.id]);
            if (blurred) OpenCV.clearBuffers([blurred.id]);
            if (gray) OpenCV.clearBuffers([gray.id]);
            if (src) OpenCV.clearBuffers([src.id]);
        }
    }

    /* Legacy detect method */
    static async detect(imageUri: string): Promise<MarkerBounds | null> {
        const result = await MarkerDetectionService.detectWithBase64(imageUri);
        return result?.bounds ?? null;
    }

    /* Marker extraction and perspective correction */
    static async extract(
        imageUriOrBase64: string,
        bounds: MarkerBounds,
        frameIndex: number,
        isBase64 = false,
    ): Promise<DetectedMarker | null> {
        let src: Mat | null = null;
        let srcPts: PointVector | null = null;
        let dstPts: PointVector | null = null;
        let M: Mat | null = null;
        let warped: Mat | null = null;
        let gray: Mat | null = null;
        let warpSize: Size | null = null;
        let borderValue: Scalar | null = null;
        const pts: any[] = [];
        const S = MARKER_OUTPUT_SIZE;

        try {
            const base64 = isBase64
                ? imageUriOrBase64
                : await RNFS.readFile(imageUriOrBase64, 'base64');
            if (!base64) return null;

            src = OpenCV.base64ToMat(base64);
            if (!src) return null;

            /* Use exact vertices if available for zero skew warping */
            if (bounds.corners && bounds.corners.length === 4) {
                const c = bounds.corners;
                const cp0 = OpenCV.createObject(
                    ObjectType.Point2f,
                    c[0].x,
                    c[0].y,
                );
                const cp1 = OpenCV.createObject(
                    ObjectType.Point2f,
                    c[1].x,
                    c[1].y,
                );
                const cp2 = OpenCV.createObject(
                    ObjectType.Point2f,
                    c[2].x,
                    c[2].y,
                );
                const cp3 = OpenCV.createObject(
                    ObjectType.Point2f,
                    c[3].x,
                    c[3].y,
                );
                pts.push(cp0, cp1, cp2, cp3);
                srcPts = OpenCV.createObject(ObjectType.Point2fVector, [
                    cp0,
                    cp1,
                    cp2,
                    cp3,
                ]);
            } else {
                /* Fallback to bounding box */
                const p0 = OpenCV.createObject(
                    ObjectType.Point2f,
                    bounds.x,
                    bounds.y,
                );
                const p1 = OpenCV.createObject(
                    ObjectType.Point2f,
                    bounds.x + bounds.width,
                    bounds.y,
                );
                const p2 = OpenCV.createObject(
                    ObjectType.Point2f,
                    bounds.x + bounds.width,
                    bounds.y + bounds.height,
                );
                const p3 = OpenCV.createObject(
                    ObjectType.Point2f,
                    bounds.x,
                    bounds.y + bounds.height,
                );
                pts.push(p0, p1, p2, p3);
                srcPts = OpenCV.createObject(ObjectType.Point2fVector, [
                    p0,
                    p1,
                    p2,
                    p3,
                ]);
            }

            /* Destination flat 300x300 square */
            const d0 = OpenCV.createObject(ObjectType.Point2f, 0, 0);
            const d1 = OpenCV.createObject(ObjectType.Point2f, S, 0);
            const d2 = OpenCV.createObject(ObjectType.Point2f, S, S);
            const d3 = OpenCV.createObject(ObjectType.Point2f, 0, S);
            pts.push(d0, d1, d2, d3);

            dstPts = OpenCV.createObject(ObjectType.Point2fVector, [
                d0,
                d1,
                d2,
                d3,
            ]);

            /* Perspective transform matrix */
            M = OpenCV.invoke(
                'getPerspectiveTransform',
                srcPts,
                dstPts,
                DecompTypes.DECOMP_LU,
            );

            /* Warp */
            warpSize = OpenCV.createObject(ObjectType.Size, S, S);
            warped = OpenCV.createObject(
                ObjectType.Mat,
                S,
                S,
                DataTypes.CV_8UC3,
            );
            borderValue = OpenCV.createObject(
                ObjectType.Scalar,
                255,
                255,
                255,
                255,
            );
            OpenCV.invoke(
                'warpPerspective',
                src,
                warped,
                M,
                warpSize,
                InterpolationFlags.INTER_LINEAR,
                BorderTypes.BORDER_CONSTANT,
                borderValue,
            );

            /* Convert to grayscale output */
            gray = OpenCV.createObject(ObjectType.Mat, S, S, DataTypes.CV_8UC1);
            OpenCV.invoke(
                'cvtColor',
                warped,
                gray,
                ColorConversionCodes.COLOR_BGR2GRAY,
            );

            /* Orientation correction at find darkest corner quadrant (marker dot) */
            const rotation = MarkerDetectionService._getRotationToTopLeft(gray);
            if (rotation !== 0) {
                const rotated = MarkerDetectionService._rotateMat(
                    gray,
                    rotation,
                );
                OpenCV.clearBuffers([gray.id]);
                gray = rotated;
            }

            const { base64: resultBase64 } = OpenCV.toJSValue(gray, 'png');
            if (!resultBase64) return null;

            const ts = Date.now();
            const outputPath = `${RNFS.CachesDirectoryPath}/marker_${frameIndex}_${ts}.png`;
            await RNFS.writeFile(outputPath, resultBase64, 'base64');

            const marker: DetectedMarker = {
                id: `marker_${frameIndex}_${ts}`,
                uri: `file://${outputPath}`,
                timestamp: ts,
                frameIndex,
                confidence: MarkerDetectionService._computeConfidence(bounds),
                orientation: 0 /* perspective warp normalises orientation */,
                width: S,
                height: S,
            };

            if (__DEV__) {
                console.log(
                    '[Extract] saved marker:',
                    marker.uri,
                    'conf:',
                    marker.confidence,
                );
            }

            return marker;
        } catch (err) {
            if (__DEV__) console.warn('[Extract] error:', err);
            return null;
        } finally {
            if (borderValue) OpenCV.clearBuffers([borderValue.id]);
            if (warpSize) OpenCV.clearBuffers([warpSize.id]);
            if (gray) OpenCV.clearBuffers([gray.id]);
            if (warped) OpenCV.clearBuffers([warped.id]);
            if (M) OpenCV.clearBuffers([M.id]);
            if (dstPts) OpenCV.clearBuffers([dstPts.id]);
            if (srcPts) OpenCV.clearBuffers([srcPts.id]);
            if (src) OpenCV.clearBuffers([src.id]);
            pts.forEach(p => {
                try {
                    OpenCV.clearBuffers([p.id]);
                } catch {
                    /* already released */
                }
            });
        }
    }

    /* Private helpers */

    /* Filters contours for square candidates */
    private static _bestCandidate(
        contours: PointVectorOfVectors,
        imageArea: number,
        imageW: number,
        imageH: number,
    ): MarkerBounds | null {
        let best: MarkerBounds | null = null;
        let bestArea = 0;

        const { array } = OpenCV.toJSValue(contours);

        for (let i = 0; i < array.length; i++) {
            const contour: PointVector = OpenCV.copyObjectFromVector(
                contours,
                i,
            );

            try {
                const { value: perimeter } = OpenCV.invoke(
                    'arcLength',
                    contour,
                    true,
                );
                const approx: PointVector = OpenCV.createObject(
                    ObjectType.PointVector,
                );
                OpenCV.invoke(
                    'approxPolyDP',
                    contour,
                    approx,
                    0.02 * perimeter,
                    true,
                );

                const { array: approxPts } = OpenCV.toJSValue(approx);
                OpenCV.clearBuffers([approx.id]);

                /* Must be quadrilateral */
                if (approxPts.length !== 4) continue;

                const { value: area } = OpenCV.invoke('contourArea', contour);
                const rectObj = OpenCV.invoke('boundingRect', contour);
                const rect = OpenCV.toJSValue(rectObj);

                /* Clamp to image bounds */
                const rx = Math.max(0, rect.x);
                const ry = Math.max(0, rect.y);
                const rw = Math.min(rect.width, imageW - rx);
                const rh = Math.min(rect.height, imageH - ry);

                if (
                    MarkerDetectionService._isValidSquare(
                        rw,
                        rh,
                        area,
                        imageArea,
                    ) &&
                    MarkerDetectionService._hasMarkerSignature(
                        rx,
                        ry,
                        rw,
                        rh,
                        imageW,
                    )
                ) {
                    if (area > bestArea) {
                        bestArea = area;
                        best = {
                            x: rx,
                            y: ry,
                            width: rw,
                            height: rh,
                            corners:
                                MarkerDetectionService._sortCorners(approxPts),
                        };
                    }
                }
            } finally {
                OpenCV.clearBuffers([contour.id]);
            }
        }

        return best;
    }

    /* Area and aspect ratio validation */
    private static _isValidSquare(
        w: number,
        h: number,
        area: number,
        imageArea: number,
    ): boolean {
        if (w <= 0 || h <= 0) return false;
        const ratio = w / h;
        const areaFraction = area / imageArea;
        return (
            Math.abs(1 - ratio) < ASPECT_RATIO_TOLERANCE &&
            areaFraction >= MIN_AREA_FRACTION &&
            areaFraction <= MAX_AREA_FRACTION
        );
    }

    /* Orientation heuristic based on quadrant intensity */
    private static _hasMarkerSignature(
        _rx: number,
        _ry: number,
        rw: number,
        rh: number,
        _imageW: number,
    ): boolean {
        if (rw <= 0 || rh <= 0) return false;
        const ratio = rw / rh;
        if (ratio < 0.6 || ratio > 1.4) return false;
        if (rw < 40 || rh < 40) return false;
        return true;
    }

    /* Confidence scoring */
    private static _computeConfidence(bounds: MarkerBounds): number {
        const ratio =
            Math.min(bounds.width, bounds.height) /
            Math.max(bounds.width, bounds.height);
        return Math.round(ratio * 100) / 100;
    }

    /* Vertex sorting order: TL, TR, BR, BL */
    private static _sortCorners(
        pts: { x: number; y: number }[],
    ): { x: number; y: number }[] {
        if (pts.length !== 4) return pts;

        /* Sort by sum (x + y) to find top-left [min] and bottom-right [max] */
        const sortedBySum = [...pts].sort((a, b) => a.x + a.y - (b.x + b.y));
        const tl = sortedBySum[0];
        const br = sortedBySum[3];

        /* Sort by difference (y - x) to find top-right [min] and bottom-left [max] */
        const sortedByDiff = [...pts].sort((a, b) => a.y - a.x - (b.y - b.x));
        const tr = sortedByDiff[0];
        const bl = sortedByDiff[3];

        return [tl, tr, br, bl];
    }

    /* Quadrant sampling for orientation detection */
    private static _getRotationToTopLeft(mat: Mat): number {
        const S = MARKER_OUTPUT_SIZE;
        const quadSize = Math.floor(S * 0.25); /* 25% of corner */

        const corners = [
            { x: 0, y: 0 } /* TL */,
            { x: S - quadSize, y: 0 } /* TR */,
            { x: S - quadSize, y: S - quadSize } /* BR */,
            { x: 0, y: S - quadSize } /* BL */,
        ];

        let minMean = 255;
        let darkIdx = 0;

        corners.forEach((c, i) => {
            const rect = OpenCV.createObject(
                ObjectType.Rect,
                c.x,
                c.y,
                quadSize,
                quadSize,
            );
            const roi = OpenCV.createObject(
                ObjectType.Mat,
                quadSize,
                quadSize,
                DataTypes.CV_8UC1,
            );
            OpenCV.invoke('crop', mat, roi, rect);
            const meanVal = OpenCV.invoke('mean', roi);
            const { a: mean } = OpenCV.toJSValue(meanVal);

            if (mean < minMean) {
                minMean = mean;
                darkIdx = i;
            }

            OpenCV.clearBuffers([roi.id, rect.id, meanVal.id]);
        });

        /* Returns degrees to rotate: 0, 90, 180, or 270 */
        return darkIdx * 90;
    }

    /* Geometric rotation helper */
    private static _rotateMat(src: Mat, degrees: number): Mat {
        const S = MARKER_OUTPUT_SIZE;
        const dst = OpenCV.createObject(
            ObjectType.Mat,
            S,
            S,
            DataTypes.CV_8UC1,
        );
        if (degrees === 90) {
            OpenCV.invoke('rotate', src, dst, RotateFlags.ROTATE_90_CLOCKWISE);
        } else if (degrees === 180) {
            OpenCV.invoke('rotate', src, dst, RotateFlags.ROTATE_180);
        } else if (degrees === 270) {
            OpenCV.invoke(
                'rotate',
                src,
                dst,
                RotateFlags.ROTATE_90_COUNTERCLOCKWISE,
            );
        } else {
            return src;
        }
        return dst;
    }
}
