/**
 * HistoryScreen
 *
 * Lists completed scan sessions in reverse-chronological order.
 * Each row shows the date, marker count, duration, and a
 * Complete / Partial status badge.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useMarkerStore, selectSessions } from '@/store';
import { AppHeader } from '@/components/shared';
import { SessionRow } from '@/components/history';
import { Colors, Layout, Spacing } from '@/constants/appConstants';
import { ScanSession } from '@/types';
import { EmptyHistoryState } from '@/components/history/EmptyHistoryState';

/* HistoryScreen */

const ListSeparator = () => <View style={styles.separator} />;

/* Lists all previous scanning sessions */
export default function HistoryScreen(): React.ReactElement {
    const navigation = useNavigation<any>();
    const sessions = useMarkerStore(selectSessions);
    const { clearHistory } = useMarkerStore();

    const handleSessionPress = useCallback(
        (_session: ScanSession) => {
            navigation.navigate('Results');
        },
        [navigation],
    );

    /* Confirms and clears the entire session history */
    const handleClearAll = useCallback(() => {
        Alert.alert(
            'Clear History',
            'This will permanently delete all scan sessions. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: clearHistory,
                },
            ],
        );
    }, [clearHistory]);

    /* Renders session list or empty state */
    return (
        <View style={Layout.flex1Bg}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

            <AppHeader
                title="Scan History"
                onBack={() => navigation.goBack()}
                rightLabel={sessions.length > 0 ? 'Clear All' : undefined}
                onRight={sessions.length > 0 ? handleClearAll : undefined}
                rightColor={Colors.red}
            />

            {sessions.length === 0 ? (
                <EmptyHistoryState
                    onStart={() => navigation.navigate('Camera')}
                />
            ) : (
                <FlatList<ScanSession>
                    data={sessions}
                    keyExtractor={s => s.id}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={ListSeparator}
                    renderItem={({ item }) => (
                        <SessionRow
                            session={item}
                            onPress={handleSessionPress}
                        />
                    )}
                />
            )}
        </View>
    );
}

/* Styles */

/* Layout for the history list and separators */
const styles = StyleSheet.create({
    list: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    separator: { height: Spacing.sm },
});
