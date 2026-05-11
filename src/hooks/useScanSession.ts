import { useRef, useState, useCallback, useEffect } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { MarkerBounds } from '@/types';
import { MarkerDetectionService } from '@/services/MarkerDetectionService';
import { useMarkerStore } from '@/store';
import {
    MAX_MARKERS,
    SCAN_INTERVAL_MS,
    CAMERA_RESOLUTION,
} from '@/constants/appConstants';
import { CameraApi } from 'react-native-camera-kit';

interface UseScanSessionReturn {
    detectedBounds: MarkerBounds | null;
    captureSize: { w: number; h: number };
    devFps: number;
    devProcessing: boolean;
    startScanning(
        cameraRef: React.RefObject<CameraApi | null>,
        onComplete: () => void,
    ): void;
    stopScanning(): void;
}

export function useScanSession(): UseScanSessionReturn {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isProcessing = useRef(false);
    const lastFrameTime = useRef(Date.now());

    const [detectedBounds, setDetectedBounds] = useState<MarkerBounds | null>(
        null,
    );
    const [captureSize, setCaptureSize] = useState({
        w: CAMERA_RESOLUTION,
        h: CAMERA_RESOLUTION,
    });
    const [devFps, setDevFps] = useState(0);
    const [devProcessing, setDevProcessing] = useState(false);

    /* Note startSession resets the store session completely
       to resume we rely on the scanStatus and resumeSession action */
    const { startSession, resumeSession, addMarker, stopSession } =
        useMarkerStore();

    const stopScanning = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setDetectedBounds(null);
        isProcessing.current = false;
        stopSession();
    }, [stopSession]);

    const startScanning = useCallback(
        (
            cameraRef: React.RefObject<CameraApi | null>,
            onComplete: () => void,
        ) => {
            if (intervalRef.current) return;

            const currentCount =
                useMarkerStore.getState().currentSession?.markers.length ?? 0;

            if (
                currentCount > 0 &&
                currentCount < MAX_MARKERS &&
                useMarkerStore.getState().scanStatus === 'idle'
            ) {
                /* It is a resume */
                if (resumeSession) resumeSession();
            } else {
                /* Fresh start */
                startSession();
            }

            intervalRef.current = setInterval(async () => {
                if (isProcessing.current || !cameraRef.current) return;

                const count =
                    useMarkerStore.getState().currentSession?.markers.length ??
                    0;
                if (count >= MAX_MARKERS) {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    onComplete();
                    return;
                }

                isProcessing.current = true;
                setDevProcessing(true);

                await new Promise(resolve =>
                    setTimeout(() => resolve(undefined), 10),
                );

                try {
                    const capture = await cameraRef.current.capture();
                    if (!capture?.uri) return;

                    setCaptureSize({
                        w: capture.width ?? CAMERA_RESOLUTION,
                        h: capture.height ?? CAMERA_RESOLUTION,
                    });

                    const now = Date.now();
                    const elapsedMs = now - lastFrameTime.current;
                    if (lastFrameTime.current !== 0) {
                        setDevFps(elapsedMs);
                    }
                    lastFrameTime.current = now;

                    const detectResult =
                        await MarkerDetectionService.detectWithBase64(
                            capture.uri,
                        );

                    if (!detectResult) {
                        setDetectedBounds(null);
                        return;
                    }

                    const { bounds, base64 } = detectResult;
                    setDetectedBounds(bounds);

                    const frameIndex =
                        useMarkerStore.getState().currentSession?.markers
                            .length ?? 0;

                    const marker = await MarkerDetectionService.extract(
                        base64,
                        bounds,
                        frameIndex,
                        true,
                    );

                    if (!marker) return;

                    ReactNativeHapticFeedback.trigger('impactLight', {
                        enableVibrateFallback: true,
                        ignoreAndroidSystemSettings: false,
                    });

                    addMarker(marker);

                    const newCount =
                        useMarkerStore.getState().currentSession?.markers
                            .length ?? 0;
                    if (newCount >= MAX_MARKERS) {
                        clearInterval(intervalRef.current!);
                        intervalRef.current = null;
                        onComplete();
                    }
                } catch (err) {
                    console.error('Scan session error:', err);
                } finally {
                    isProcessing.current = false;
                    setDevProcessing(false);
                }
            }, SCAN_INTERVAL_MS);
        },
        [addMarker, startSession, resumeSession],
    );

    useEffect(
        () => () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        },
        [],
    );

    return {
        detectedBounds,
        captureSize,
        devFps,
        devProcessing,
        startScanning,
        stopScanning,
    };
}
