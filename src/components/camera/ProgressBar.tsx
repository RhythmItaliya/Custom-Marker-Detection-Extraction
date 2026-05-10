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
        progress.value = withTiming(current / total, { duration: 300 });
    }, [current, total, progress]);

    const fillStyle = useAnimatedStyle(() => ({
        width: `${interpolate(progress.value, [0, 1], [0, 100])}%` as any,
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.fill, fillStyle]} />
            <Text style={styles.label}>
                {current} / {total} markers
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 160,
        left: Spacing.xxl,
        right: Spacing.xxl,
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
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        ...Typography.caption,
        color: Colors.muted,
        fontWeight: '500',
    },
});
