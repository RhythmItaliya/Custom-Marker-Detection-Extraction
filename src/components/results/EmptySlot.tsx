import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/appConstants';
import { CELL } from './MarkerCard';

interface EmptySlotProps {
    index: number;
}

export function EmptySlot({ index }: EmptySlotProps): React.ReactElement {
    return (
        <View style={styles.root}>
            <Text style={styles.text}>{index + 1}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: CELL,
        height: CELL,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        ...Layout.center,
    },
    text: {
        ...Typography.caption,
        color: Colors.textTertiary,
        fontSize: 13,
        fontWeight: '600',
    },
});
