/* Camera Viewfinder and Scanner Interface */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useNavigation } from '@react-navigation/native';

import { useMarkerStore, selectMarkerCount } from '@/store';
import { useScanSession } from '@/hooks';
import { requestCameraPermission } from '@/utils/permissions';
import {
    ScanLine,
    DetectionBox,
    ProgressBar,
    StatusRow,
    DebugOverlay,
} from '@/components/camera';
import {
    Colors,
    Layout,
    Typography,
    MAX_MARKERS,
    Spacing,
} from '@/constants/appConstants';

/* Live marker scanning interface */
export default function CameraScreen(): React.ReactElement {
    const navigation = useNavigation<any>();
    const cameraRef = useRef<any>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const { scanStatus } = useMarkerStore();
    const markerCount = useMarkerStore(selectMarkerCount);

    const {
        detectedBounds,
        captureSize,
        devFps,
        devProcessing,
        startScanning,
        stopScanning,
    } = useScanSession();

    /* Camera access */
    useEffect(() => {
        requestCameraPermission().then(setHasPermission);
    }, []);

    /* Toggle scanning session */
    const handleScanPress = useCallback(() => {
        if (scanStatus === 'scanning') {
            stopScanning(); /* handles interval clearing and saving session */
        } else if (markerCount >= MAX_MARKERS || scanStatus === 'complete') {
            navigation.navigate('Results');
        } else {
            startScanning(cameraRef, () => navigation.navigate('Results'));
        }
    }, [scanStatus, markerCount, stopScanning, navigation, startScanning]);

    /* Display formatting */

    const statusText =
        scanStatus === 'scanning'
            ? 'Scanning — point at a marker'
            : scanStatus === 'complete'
            ? 'Complete'
            : markerCount > 0
            ? `Paused (${markerCount} scanned)`
            : 'Press Start to scan';

    const scanBtnLabel =
        scanStatus === 'scanning'
            ? 'Stop'
            : markerCount >= MAX_MARKERS || scanStatus === 'complete'
            ? 'View Results'
            : markerCount > 0
            ? 'Resume Scan'
            : 'Start Scan';

    const scanBtnColor = scanStatus === 'scanning' ? Colors.red : Colors.cyan;

    /* Loading states */

    if (hasPermission === null) {
        return (
            <View style={styles.permContainer}>
                <Text style={styles.permText}>Requesting camera access…</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.permContainer}>
                <Text style={styles.permText}>
                    Camera permission is required to scan markers.
                </Text>
                <TouchableOpacity
                    style={styles.permBtn}
                    onPress={() =>
                        requestCameraPermission().then(setHasPermission)
                    }
                >
                    <Text style={styles.permBtnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /* Main render */

    /* UI rendering with conditional overlays */
    return (
        <View style={styles.root}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.black}
            />

            {/*
        react-native-camera-kit does NOT support photoHeight/photoWidth props.
        The 2000px capture resolution is enforced inside useScanSession via
        capture({ quality: 1.0 }) which uses the device's native max resolution.
      */}
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                cameraType={CameraType.Back}
                flashMode="auto"
                onReadCode={() => {}}
                onOrientationChange={() => {}}
            />

            {scanStatus === 'scanning' && <ScanLine />}

            {detectedBounds && scanStatus === 'scanning' && (
                <DetectionBox
                    bounds={detectedBounds}
                    imageW={captureSize.w}
                    imageH={captureSize.h}
                />
            )}

            <View style={styles.header}>
                <Text style={styles.headerTitle}>MarkerScanner</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('History')}
                >
                    <Text style={styles.historyLink}>History</Text>
                </TouchableOpacity>
            </View>

            <ProgressBar current={markerCount} total={MAX_MARKERS} />

            <StatusRow active={scanStatus === 'scanning'} text={statusText} />

            <TouchableOpacity
                style={[styles.scanBtn, { backgroundColor: scanBtnColor }]}
                onPress={handleScanPress}
                activeOpacity={0.85}
            >
                <Text style={styles.scanBtnText}>{scanBtnLabel}</Text>
            </TouchableOpacity>

            <DebugOverlay
                markerCount={markerCount}
                isProcessing={devProcessing}
                lastBounds={detectedBounds}
                fps={devFps}
            />
        </View>
    );
}

/* Component-specific styles using theme constants */
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.black },

    header: {
        ...Layout.rowBetween,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: Colors.overlay,
    },
    headerTitle: {
        ...Typography.title,
    },
    historyLink: {
        ...Typography.subtitle,
        color: Colors.cyan,
        fontWeight: '600',
    },

    scanBtn: {
        ...Layout.center,
        position: 'absolute',
        bottom: Spacing.xxxl,
        left: Spacing.xxxl,
        right: Spacing.xxxl,
        height: 56,
        borderRadius: 28,
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 10,
    },
    scanBtnText: {
        ...Typography.body,
        fontWeight: '700',
        color: Colors.black,
        letterSpacing: 0.4,
    },

    permContainer: {
        ...Layout.flex1Bg,
        ...Layout.center,
        paddingHorizontal: 32,
        gap: 20,
    },
    permText: {
        ...Typography.body,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    permBtn: {
        backgroundColor: Colors.cyan,
        paddingHorizontal: Spacing.xxxl,
        paddingVertical: 14,
        borderRadius: 28,
    },
    permBtnText: {
        ...Typography.subtitle,
        color: Colors.black,
        fontWeight: '700',
    },
});
