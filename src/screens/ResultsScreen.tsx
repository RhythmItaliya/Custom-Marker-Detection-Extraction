/**
 * ResultsScreen
 *
 * Displays a 4-column grid of 20 slots. Detected markers show their
 * extracted 300×300 image with index badge, timestamp, and confidence.
 * Empty slots show a dashed placeholder.
 *
 * Stateless except for the share handler — all data from store.
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Share,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
    useMarkerStore,
    selectElapsedSeconds,
    selectCurrentSession,
} from '@/store';
import { AppHeader, StatsRow, PrimaryButton } from '@/components/shared';
import { MarkerCard, EmptySlot } from '@/components/results';
import {
    Colors,
    MAX_MARKERS,
    MARKER_OUTPUT_SIZE,
    GRID_COLUMNS,
    GRID_GAP,
    GRID_PADDING,
    Layout,
    Typography,
    Spacing,
} from '@/constants/appConstants';
import { DetectedMarker, StatItem } from '@/types';

/* Grid item type */

interface GridItem {
    index: number;
    marker: DetectedMarker | null;
}

/* ResultsScreen */

/* Displays the outcome of a scan session in a grid */
export default function ResultsScreen(): React.ReactElement {
    const navigation = useNavigation<any>();
    const currentSession = useMarkerStore(selectCurrentSession);
    const elapsed = useMarkerStore(selectElapsedSeconds);

    const markers = currentSession?.markers ?? [];

    /* Build full 20 slot array */
    const gridItems: GridItem[] = Array.from(
        { length: MAX_MARKERS },
        (_, i) => ({
            index: i,
            marker: markers[i] ?? null,
        }),
    );

    /* Shared detected statistics via native share sheet */
    const handleShare = useCallback(async () => {
        try {
            await Share.share({
                message:
                    `MarkerScanner Results\n` +
                    `Detected: ${markers.length}/${MAX_MARKERS}\n` +
                    `Duration: ${elapsed ?? 'in progress'}s\n` +
                    `Session: ${currentSession?.id ?? 'N/A'}`,
            });
        } catch {
            /* User dismissed share sheet no action needed */
        }
    }, [markers.length, elapsed, currentSession]);

    const statItems: StatItem[] = [
        { label: 'Detected', value: markers.length },
        { label: 'Total Frames', value: MAX_MARKERS },
        { label: 'Duration', value: elapsed ? `${elapsed}s` : '—' },
    ];

    /* Renders header, statistics, and the marker grid */
    return (
        <View style={Layout.flex1Bg}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

            <AppHeader
                title="Results"
                onBack={() => navigation.goBack()}
                rightLabel="Share"
                onRight={handleShare}
            />

            <StatsRow items={statItems} />

            <Text style={styles.gridLabel}>
                Extracted Markers — {MARKER_OUTPUT_SIZE}×{MARKER_OUTPUT_SIZE}px
                each
            </Text>

            <FlatList<GridItem>
                data={gridItems}
                numColumns={GRID_COLUMNS}
                keyExtractor={item => `slot_${item.index}`}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) =>
                    item.marker ? (
                        <MarkerCard marker={item.marker} index={item.index} />
                    ) : (
                        <EmptySlot index={item.index} />
                    )
                }
            />

            <PrimaryButton
                label="Scan Again"
                onPress={() => navigation.navigate('Camera')}
            />
        </View>
    );
}

/* Styles */

/* Layout styling for the results grid */
const styles = StyleSheet.create({
    gridLabel: {
        ...Typography.caption,
        color: Colors.muted,
        fontWeight: '500',
        marginHorizontal: GRID_PADDING,
        marginBottom: Spacing.md,
        letterSpacing: 0.4,
    },
    grid: { paddingHorizontal: GRID_PADDING, paddingBottom: 110 },
    row: { gap: GRID_GAP, marginBottom: GRID_GAP },
});
