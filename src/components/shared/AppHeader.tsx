import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/appConstants';

interface AppHeaderProps {
    title: string;
    onBack?: () => void;
    rightLabel?: string;
    onRight?: () => void;
    rightColor?: string;
}

export function AppHeader({
    title,
    onBack,
    rightLabel,
    onRight,
    rightColor = Colors.cyan,
}: AppHeaderProps): React.ReactElement {
    return (
        <View style={styles.root}>
            {onBack ? (
                <TouchableOpacity
                    onPress={onBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.back}>Back</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.spacer} />
            )}

            <Text style={styles.title}>{title}</Text>

            {rightLabel && onRight ? (
                <TouchableOpacity
                    onPress={onRight}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={[styles.right, { color: rightColor }]}>
                        {rightLabel}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.spacer} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...Layout.rowBetween,
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: Colors.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    back: {
        ...Typography.subtitle,
        color: Colors.cyan,
        fontWeight: '600',
        width: 60,
    },
    title: {
        ...Typography.title,
        letterSpacing: 0.3,
    },
    right: {
        ...Typography.subtitle,
        fontWeight: '600',
        width: 60,
        textAlign: 'right',
    },
    spacer: { width: 60 },
});
