import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Layout } from '@/constants/appConstants';

interface StatusRowProps {
    active: boolean;
    text: string;
}

export function StatusRow({
    active,
    text,
}: StatusRowProps): React.ReactElement {
    return (
        <View style={styles.row}>
            <View
                style={[
                    styles.dot,
                    { backgroundColor: active ? Colors.green : Colors.red },
                ]}
            />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        position: 'absolute',
        bottom: 128,
        left: Spacing.xxl,
        ...Layout.rowCenter,
        gap: Spacing.sm,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    text: {
        ...Typography.caption,
        color: Colors.white,
        fontSize: 13,
        fontWeight: '500',
    },
});
