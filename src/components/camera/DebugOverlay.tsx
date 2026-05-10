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
    if (!__DEV__) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={styles.text}>DEV MODE</Text>
            <Text style={styles.text}>Markers: {markerCount}</Text>
            <Text style={styles.text}>
                Processing: {isProcessing ? 'YES' : 'no'}
            </Text>
            <Text style={styles.text}>FPS: ~{fps.toFixed(1)}</Text>
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
