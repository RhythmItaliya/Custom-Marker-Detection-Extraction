import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/appConstants';
import { StatItem } from '@/types';

interface StatsRowProps {
    items: StatItem[];
}

export function StatsRow({ items }: StatsRowProps): React.ReactElement {
    return (
        <View style={styles.row}>
            {items.map((item, idx) => (
                <React.Fragment key={item.label}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.box}>
                        <Text style={styles.value}>{item.value}</Text>
                        <Text style={styles.label}>{item.label}</Text>
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        ...Layout.rowCenter,
        marginHorizontal: 24,
        marginVertical: 12,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    box: { ...Layout.flex1, alignItems: 'center', paddingVertical: 16 },
    value: {
        ...Typography.h1,
        color: Colors.cyan,
    },
    label: {
        ...Typography.caption,
        fontWeight: '500',
        marginTop: 4,
    },
    divider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: Colors.border,
    },
});
