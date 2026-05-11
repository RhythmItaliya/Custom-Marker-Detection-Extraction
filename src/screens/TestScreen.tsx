/* Detection Test Screen */
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';

import { MarkerDetectionService } from '@/services/MarkerDetectionService';
import { AppHeader, BottomTabBar } from '@/components/shared';
import { Colors, Typography, Spacing, Layout } from '@/constants/appConstants';
import { RootStackParamList } from '@/types';

/* ------------------------------------------------------------------ */
/* Test image registry                                                  */
/* ------------------------------------------------------------------ */

interface TestCase {
    id: string;
    label: string;
    isCorrect: boolean;
    source: ReturnType<typeof require>;
}

const TEST_CASES: TestCase[] = [
    {
        id: 'm1_c1',
        label: 'M1 · Image 1 ✓',
        isCorrect: true,
        source: require('@/assets/test/m1_c1.jpg'),
    },
    {
        id: 'm1_c2',
        label: 'M1 · Image 2 ✓',
        isCorrect: true,
        source: require('@/assets/test/m1_c2.jpg'),
    },
    {
        id: 'm1_c3',
        label: 'M1 · Image 3 ✓',
        isCorrect: true,
        source: require('@/assets/test/m1_c3.jpg'),
    },
    {
        id: 'm1_i4',
        label: 'M1 · Image 4 ✗',
        isCorrect: false,
        source: require('@/assets/test/m1_i4.jpg'),
    },
    {
        id: 'm1_i5',
        label: 'M1 · Image 5 ✗',
        isCorrect: false,
        source: require('@/assets/test/m1_i5.jpg'),
    },
    {
        id: 'm1_i6',
        label: 'M1 · Image 6 ✗',
        isCorrect: false,
        source: require('@/assets/test/m1_i6.jpg'),
    },
    {
        id: 'm1_i7',
        label: 'M1 · Image 7 ✗',
        isCorrect: false,
        source: require('@/assets/test/m1_i7.jpg'),
    },
    {
        id: 'm2_c1',
        label: 'M2 · Image 1 ✓',
        isCorrect: true,
        source: require('@/assets/test/m2_c1.jpg'),
    },
    {
        id: 'm2_c2',
        label: 'M2 · Image 2 ✓',
        isCorrect: true,
        source: require('@/assets/test/m2_c2.jpg'),
    },
    {
        id: 'm2_c3',
        label: 'M2 · Image 3 ✓',
        isCorrect: true,
        source: require('@/assets/test/m2_c3.jpg'),
    },
    {
        id: 'm2_i4',
        label: 'M2 · Image 4 ✗',
        isCorrect: false,
        source: require('@/assets/test/m2_i4.jpg'),
    },
    {
        id: 'm2_i5',
        label: 'M2 · Image 5 ✗',
        isCorrect: false,
        source: require('@/assets/test/m2_i5.jpg'),
    },
    {
        id: 'm2_i6',
        label: 'M2 · Image 6 ✗',
        isCorrect: false,
        source: require('@/assets/test/m2_i6.jpg'),
    },
    {
        id: 'm2_i7',
        label: 'M2 · Image 7 ✗',
        isCorrect: false,
        source: require('@/assets/test/m2_i7.jpg'),
    },
];

interface CardResult {
    status: 'idle' | 'processing' | 'detected' | 'failed';
    outputUri?: string;
    confidence?: number;
    elapsedMs?: number;
    errorMsg?: string;
}

import { Beaker, ClipboardList, Camera, RotateCcw } from 'lucide-react-native';

const TABS = [
    { key: 'test', label: 'Test', icon: Beaker },
    { key: 'history', label: 'History', icon: ClipboardList },
    { key: 'camera', label: 'Camera', icon: Camera },
];

/* ------------------------------------------------------------------ */
/* TestScreen                                                           */
/* ------------------------------------------------------------------ */

type TestScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Test'
>;

export default function TestScreen(): React.ReactElement {
    const navigation = useNavigation<TestScreenNavigationProp>();
    const [results, setResults] = useState<Record<string, CardResult>>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    /* Summary stats */
    const done = Object.values(results).filter(
        r => r.status !== 'idle' && r.status !== 'processing',
    );
    const passed = done.filter(r => {
        const tc = TEST_CASES.find(t => results[t.id] === r);
        return tc ? (r.status === 'detected') === tc.isCorrect : false;
    }).length;
    const total = TEST_CASES.length;

    /* Resolve bundled image to local path */
    const resolveAssetPath = useCallback(
        async (source: ReturnType<typeof require>): Promise<string | null> => {
            const { uri } = Image.resolveAssetSource(source);
            if (!uri) return null;
            const tmp = `${RNFS.CachesDirectoryPath}/mktest_${Date.now()}.jpg`;
            if (uri.startsWith('http://') || uri.startsWith('https://')) {
                try {
                    const resp = await fetch(uri);
                    if (!resp.ok) return null;
                    const blob = await resp.blob();
                    const b64: string = await new Promise((res, rej) => {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                            res((reader.result as string).split(',')[1] ?? '');
                        reader.onerror = rej;
                        reader.readAsDataURL(blob);
                    });
                    await RNFS.writeFile(tmp, b64, 'base64');
                    return tmp;
                } catch {
                    return null;
                }
            }
            if (uri.startsWith('file://')) return uri.replace('file://', '');
            if (uri.startsWith('/')) return uri;
            try {
                await RNFS.copyFileAssets(uri.replace(/^asset:\/?/, ''), tmp);
                return tmp;
            } catch {
                return null;
            }
        },
        [],
    );

    /* Run one test case */
    const runOne = useCallback(
        async (tc: TestCase) => {
            if (processingId) return;
            setProcessingId(tc.id);
            setResults(p => ({ ...p, [tc.id]: { status: 'processing' } }));
            const t0 = Date.now();
            try {
                const path = await resolveAssetPath(tc.source);
                if (!path) throw new Error('Path resolve failed');
                const fileUri = path.startsWith('file://')
                    ? path
                    : `file://${path}`;
                const det = await MarkerDetectionService.detectWithBase64(
                    fileUri,
                );
                if (!det) {
                    setResults(p => ({
                        ...p,
                        [tc.id]: {
                            status: 'failed',
                            elapsedMs: Date.now() - t0,
                        },
                    }));
                    return;
                }
                const marker = await MarkerDetectionService.extract(
                    det.base64,
                    det.bounds,
                    0,
                    true,
                );
                if (!marker) {
                    setResults(p => ({
                        ...p,
                        [tc.id]: {
                            status: 'failed',
                            elapsedMs: Date.now() - t0,
                            errorMsg: 'Content rejected',
                        },
                    }));
                    return;
                }
                setResults(p => ({
                    ...p,
                    [tc.id]: {
                        status: 'detected',
                        outputUri: marker.uri,
                        confidence: marker.confidence,
                        elapsedMs: Date.now() - t0,
                    },
                }));
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : String(err);
                setResults(p => ({
                    ...p,
                    [tc.id]: {
                        status: 'failed',
                        elapsedMs: Date.now() - t0,
                        errorMsg: errorMessage,
                    },
                }));
            } finally {
                setProcessingId(null);
            }
        },
        [processingId, resolveAssetPath],
    );

    /* Run all sequentially */
    const runAll = useCallback(async () => {
        for (const tc of TEST_CASES) {
            if (processingId) break;
            await runOne(tc);
        }
    }, [runOne, processingId]);

    const resetAll = useCallback(() => setResults({}), []);

    const onTabPress = useCallback(
        (key: string) => {
            if (key === 'camera') navigation.navigate('Camera');
            if (key === 'history') navigation.navigate('History');
        },
        [navigation],
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

            <AppHeader
                title="Detection Test"
                onBack={() => navigation.goBack()}
                rightLabel={
                    Object.keys(results).length > 0 ? 'Reset' : undefined
                }
                rightIcon={
                    Object.keys(results).length > 0 ? RotateCcw : undefined
                }
                onRight={resetAll}
                rightColor={Colors.muted}
            />

            {/* Summary bar */}
            <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>
                    {done.length}/{total} run
                </Text>
                <View style={styles.summaryDivider} />
                <Text style={[styles.summaryText, { color: Colors.green }]}>
                    {passed} pass
                </Text>
                <View style={styles.summaryDivider} />
                <Text
                    style={[
                        styles.summaryText,
                        {
                            color:
                                done.length - passed > 0
                                    ? Colors.red
                                    : Colors.muted,
                        },
                    ]}
                >
                    {done.length - passed} fail
                </Text>
                <TouchableOpacity
                    style={styles.runAllBtn}
                    onPress={runAll}
                    disabled={!!processingId}
                    activeOpacity={0.8}
                >
                    <Text style={styles.runAllText}>
                        {processingId ? '…' : '▶ Run All'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            >
                {TEST_CASES.map(tc => (
                    <TestCard
                        key={tc.id}
                        tc={tc}
                        result={results[tc.id]}
                        isProcessing={processingId === tc.id}
                        isDisabled={!!processingId && processingId !== tc.id}
                        onRun={() => runOne(tc)}
                        onReset={() =>
                            setResults(p => {
                                const n = { ...p };
                                delete n[tc.id];
                                return n;
                            })
                        }
                    />
                ))}
                <View style={{ height: 24 }} />
            </ScrollView>

            <BottomTabBar tabs={TABS} activeKey="test" onPress={onTabPress} />
        </View>
    );
}

/* ------------------------------------------------------------------ */
/* TestCard                                                             */
/* ------------------------------------------------------------------ */

function TestCard({
    tc,
    result,
    isProcessing,
    isDisabled,
    onRun,
    onReset,
}: {
    tc: TestCase;
    result: CardResult | undefined;
    isProcessing: boolean;
    isDisabled: boolean;
    onRun: () => void;
    onReset: () => void;
}): React.ReactElement {
    const detected = result?.status === 'detected';
    const failed = result?.status === 'failed';
    const hasResult = detected || failed;

    /* Verdict: PASS if detection matches expectation */
    const verdict = hasResult
        ? detected === tc.isCorrect
            ? { label: 'PASS', color: Colors.green }
            : detected
            ? { label: 'FALSE+', color: Colors.yellow }
            : { label: 'MISS', color: Colors.red }
        : null;

    const expColor = tc.isCorrect ? Colors.green : Colors.red;

    return (
        <View
            style={[
                styles.card,
                verdict && { borderColor: `${verdict.color}33` },
            ]}
        >
            <View style={Layout.rowBetween}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>{tc.label}</Text>
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: `${expColor}18` },
                        ]}
                    >
                        <Text style={[styles.badgeText, { color: expColor }]}>
                            {tc.isCorrect ? 'Should Detect' : 'Should Skip'}
                        </Text>
                    </View>
                </View>
                {verdict && (
                    <View
                        style={[
                            styles.verdict,
                            { backgroundColor: `${verdict.color}18` },
                        ]}
                    >
                        <Text
                            style={[
                                styles.verdictText,
                                { color: verdict.color },
                            ]}
                        >
                            {verdict.label}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.imageRow}>
                <View style={styles.imgBox}>
                    <Text style={styles.imgLabel}>INPUT</Text>
                    <Image
                        source={tc.source}
                        style={styles.img}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.imgBox}>
                    <Text style={styles.imgLabel}>OUTPUT</Text>
                    {isProcessing ? (
                        <View style={styles.placeholder}>
                            <ActivityIndicator color={Colors.cyan} />
                        </View>
                    ) : detected && result?.outputUri ? (
                        <Image
                            source={{ uri: result.outputUri }}
                            style={styles.img}
                            resizeMode="contain"
                        />
                    ) : (
                        <View
                            style={[
                                styles.placeholder,
                                failed && { borderColor: `${Colors.red}44` },
                            ]}
                        >
                            <Text style={styles.placeholderIcon}>
                                {failed ? '✗' : '?'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {hasResult && (
                <Text
                    style={[
                        styles.resultText,
                        { color: detected ? Colors.green : Colors.red },
                    ]}
                >
                    {detected
                        ? `✓ Detected  ${(
                              (result!.confidence ?? 0) * 100
                          ).toFixed(0)}% conf  ${result!.elapsedMs}ms`
                        : result?.errorMsg
                        ? `✗ ${result.errorMsg}`
                        : `✗ No marker  ${result!.elapsedMs}ms`}
                </Text>
            )}

            {!hasResult ? (
                <TouchableOpacity
                    style={[styles.btn, isDisabled && styles.btnDisabled]}
                    onPress={onRun}
                    disabled={isProcessing || isDisabled}
                    activeOpacity={0.8}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={Colors.black} size="small" />
                    ) : (
                        <Text style={styles.btnText}>
                            {isDisabled ? 'Waiting…' : '▶ Run'}
                        </Text>
                    )}
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={onReset}
                    activeOpacity={0.8}
                >
                    <Text style={styles.resetBtnText}>↺ Reset</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    summaryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
        gap: Spacing.md,
    },
    summaryText: {
        ...Typography.caption,
        fontWeight: '600',
        color: Colors.muted,
    },
    summaryDivider: {
        width: StyleSheet.hairlineWidth,
        height: 14,
        backgroundColor: Colors.border,
    },
    runAllBtn: {
        marginLeft: 'auto',
        backgroundColor: Colors.cyan,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
    },
    runAllText: {
        ...Typography.caption,
        color: Colors.black,
        fontWeight: '700',
    },

    list: { padding: Spacing.lg, gap: Spacing.md },

    /* Card */
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md,
    },
    cardLabel: {
        ...Typography.body,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
    verdict: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    verdictText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

    /* Images */
    imageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    imgBox: { flex: 1, alignItems: 'center', gap: 4 },
    imgLabel: {
        ...Typography.caption,
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: '600',
    },
    img: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    placeholder: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: Colors.surfaceSubtle,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: { fontSize: 24, color: Colors.muted },
    arrow: { ...Typography.body, color: Colors.muted },

    resultText: { ...Typography.caption, fontWeight: '600' },

    btn: {
        backgroundColor: Colors.cyan,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.4 },
    btnText: { ...Typography.caption, color: Colors.black, fontWeight: '700' },
    resetBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    resetBtnText: { ...Typography.caption, color: Colors.muted },
});
