import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout, Typography } from '@/constants/appConstants';
import { PrimaryButton } from '@/components/shared';

interface EmptyHistoryStateProps {
    onStart(): void;
}

export function EmptyHistoryState({
    onStart,
}: EmptyHistoryStateProps): React.ReactElement {
    return (
        <View style={styles.root}>
            <Text style={styles.title}>No scans yet</Text>
            <Text style={styles.sub}>
                Complete a scan session to see your history here.
            </Text>
            <PrimaryButton
                label="Start Scanning"
                onPress={onStart}
                style={styles.btn}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...Layout.flex1,
        ...Layout.center,
        paddingHorizontal: 40,
        gap: 12,
    },
    title: { ...Typography.title },
    sub: {
        ...Typography.subtitle,
        textAlign: 'center',
    },
    btn: {
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        marginTop: 12,
        width: 200,
        alignSelf: 'center',
    },
});
