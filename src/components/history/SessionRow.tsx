import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
    Colors,
    MAX_MARKERS,
    Layout,
    Typography,
} from '@/constants/appConstants';
import { ScanSession } from '@/types';
import { formatDateTime } from '@/utils';

interface SessionRowProps {
    session: ScanSession;
    onPress(s: ScanSession): void;
}

export function SessionRow({
    session,
    onPress,
}: SessionRowProps): React.ReactElement {
    const duration = session.completedAt
        ? ((session.completedAt - session.startedAt) / 1000).toFixed(1)
        : null;

    const isComplete = session.markers.length === MAX_MARKERS;

    return (
        <TouchableOpacity
            style={styles.root}
            onPress={() => onPress(session)}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                <Text style={styles.date}>
                    {formatDateTime(session.startedAt)}
                </Text>
                <Text style={styles.sub}>
                    {session.markers.length}/{MAX_MARKERS} markers
                    {duration ? `  •  ${duration}s` : ''}
                </Text>
            </View>

            <View
                style={[
                    styles.badge,
                    {
                        backgroundColor: isComplete
                            ? Colors.badgeCompleteBg
                            : Colors.badgePartialBg,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.badgeText,
                        { color: isComplete ? Colors.green : Colors.red },
                    ]}
                >
                    {isComplete ? 'Complete' : 'Partial'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    root: {
        ...Layout.rowBetween,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.border,
    },
    left: { ...Layout.flex1, gap: 4 },
    date: { ...Typography.subtitle, color: Colors.white, fontWeight: '600' },
    sub: { ...Typography.caption },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '700' },
});
