import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { Colors } from '@/constants/appConstants';

interface FocusIndicatorProps {
    x: number;
    y: number;
    onComplete: () => void;
}

export function FocusIndicator({
    x,
    y,
    onComplete,
}: FocusIndicatorProps): React.ReactElement {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1.5);

    useEffect(() => {
        opacity.value = withSequence(
            withTiming(1, { duration: 150 }),
            withDelay(800, withTiming(0, { duration: 300 })),
        );
        scale.value = withTiming(1, { duration: 250 });

        const timer = setTimeout(onComplete, 1250);
        return () => clearTimeout(timer);
    }, [x, y, onComplete, opacity, scale]);

    const rStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
        left: x - 35,
        top: y - 35,
    }));

    return <Animated.View style={[styles.box, rStyle]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderWidth: 1.5,
        borderColor: Colors.yellow,
        backgroundColor: 'transparent',
    },
});
