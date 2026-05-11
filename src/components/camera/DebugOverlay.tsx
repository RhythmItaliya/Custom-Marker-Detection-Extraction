import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MarkerBounds } from '@/types';
import { Colors, Spacing } from '@/constants/appConstants';

interface DebugOverlayProps {
    markerCount: number;
    isProcessing: boolean;
    lastBounds: MarkerBounds | null;
    fps: number;
}

export function DebugOverlay({
    markerCount,
    isProcessing,
    lastBounds,
    fps,
}: DebugOverlayProps): React.ReactElement | null {
    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={styles.text}>LIVE METRICS</Text>
            <Text style={styles.text}>Markers: {markerCount}</Text>
            <Text style={styles.text}>
                Processing: {isProcessing ? 'YES' : 'no'}
            </Text>
            <Text style={styles.text}>Frame: {fps}ms</Text>
            {lastBounds && (
                <Text style={styles.text}>
                    Bounds: {Math.round(lastBounds.x)},
                    {Math.round(lastBounds.y)} {Math.round(lastBounds.width)}×
                    {Math.round(lastBounds.height)}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 110,
        right: Spacing.md,
        backgroundColor: Colors.overlay,
        borderRadius: 8,
        padding: Spacing.sm,
        gap: 2,
    },
    text: {
        color: Colors.yellow,
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: '600',
    },
});
