import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/appConstants';
import { MarkerBounds } from '@/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface DetectionBoxProps {
    bounds: MarkerBounds;
    imageW: number;
    imageH: number;
}

export function DetectionBox({
    bounds,
    imageW,
    imageH,
}: DetectionBoxProps): React.ReactElement {
    const scaleX = SCREEN_W / imageW;
    const scaleY = (SCREEN_H * 0.75) / imageH;
    const scale = useSharedValue(0.9);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }, [bounds, scale]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.box,
                animStyle,
                {
                    left: bounds.x * scaleX,
                    top: bounds.y * scaleY,
                    width: bounds.width * scaleX,
                    height: bounds.height * scaleY,
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        borderWidth: 2.5,
        borderColor: Colors.green,
        borderRadius: 4,
        backgroundColor: Colors.detectionBoxBg,
    },
});
