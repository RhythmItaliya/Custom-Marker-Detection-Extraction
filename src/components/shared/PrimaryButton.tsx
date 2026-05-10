import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout, Typography, Spacing } from '@/constants/appConstants';

interface PrimaryButtonProps {
    label: string;
    onPress: () => void;
    color?: string;
    style?: ViewStyle;
}

export function PrimaryButton({
    label,
    onPress,
    color = Colors.cyan,
    style,
}: PrimaryButtonProps): React.ReactElement {
    return (
        <TouchableOpacity
            style={[styles.root, { backgroundColor: color }, style]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    root: {
        ...Layout.center,
        position: 'absolute',
        bottom: Spacing.xxxl,
        left: Spacing.xxxl,
        right: Spacing.xxxl,
        height: 54,
        borderRadius: 27,
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    label: {
        ...Typography.button,
        color: Colors.black,
    },
});
