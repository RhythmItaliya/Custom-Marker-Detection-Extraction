import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/appConstants';

interface ProgressBarProps {
    current: number;
    total: number;
}

export function ProgressBar({
    current,
    total,
}: ProgressBarProps): React.ReactElement {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(total > 0 ? current / total : 0, { duration: 300 });
    }, [current, total, progress]);

    const fillStyle = useAnimatedStyle(() => {
        return {
            width: `${Math.max(0, Math.min(100, progress.value * 100))}%` as any,
        };
    });

    return (
        <View style={styles.container} pointerEvents="none">
            <View style={styles.track}>
                <Animated.View style={[styles.fill, fillStyle]} />
            </View>
            <Text style={styles.label}>
                {current} / {total} markers
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 150,
        left: Spacing.xxl,
        right: Spacing.xxl,
        alignItems: 'center',
    },
    track: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.surfaceSubtle,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: Colors.cyan,
    },
    label: {
        marginTop: 12,
        ...Typography.caption,
        color: Colors.muted,
        fontWeight: '500',
    },
});
