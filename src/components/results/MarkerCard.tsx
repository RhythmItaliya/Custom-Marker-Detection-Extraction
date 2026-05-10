import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import {
    Colors,
    GRID_COLUMNS,
    GRID_GAP,
    GRID_PADDING,
    Typography,
    Layout,
} from '@/constants/appConstants';
import { DetectedMarker } from '@/types';
import { formatTime } from '@/utils';

const { width: SCREEN_W } = Dimensions.get('window');
export const CELL =
    (SCREEN_W - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;

interface MarkerCardProps {
    marker: DetectedMarker;
    index: number;
}

export function MarkerCard({
    marker,
    index,
}: MarkerCardProps): React.ReactElement {
    if (__DEV__) {
        console.log(
            `[ResultsScreen] rendering marker ${index}:`,
            marker.uri,
            `conf:${marker.confidence}`,
        );
    }

    return (
        <View style={styles.root}>
            <Image
                source={{ uri: marker.uri }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.time}>{formatTime(marker.timestamp)}</Text>
                <Text style={styles.conf}>
                    {Math.round(marker.confidence * 100)}%
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: CELL,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.borderAccent,
    },
    image: { width: CELL, height: CELL },
    badge: {
        position: 'absolute',
        top: 4,
        left: 4,
        backgroundColor: Colors.cyanSemi,
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    badgeText: {
        ...Typography.caption,
        color: Colors.black,
        fontSize: 9,
        fontWeight: '800',
    },
    footer: {
        ...Layout.rowBetween,
        paddingHorizontal: 5,
        paddingVertical: 4,
        backgroundColor: Colors.overlay,
    },
    time: {
        ...Typography.caption,
        color: Colors.muted,
        fontSize: 8,
        fontWeight: '500',
    },
    conf: {
        ...Typography.caption,
        color: Colors.green,
        fontSize: 8,
        fontWeight: '700',
    },
});
