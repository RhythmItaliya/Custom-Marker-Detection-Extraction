import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Colors, Spacing } from '@/constants/appConstants';

export function ScanLine(): React.ReactElement {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(220, {
                duration: 1800,
                easing: Easing.inOut(Easing.quad),
            }),
            -1,
            true,
        );
    }, [translateY]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={[styles.line, animStyle]} />;
}

const styles = StyleSheet.create({
    line: {
        position: 'absolute',
        left: Spacing.xxl,
        right: Spacing.xxl,
        top: 100,
        height: 2,
        borderRadius: 1,
        backgroundColor: Colors.cyan,
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 8,
    },
});
