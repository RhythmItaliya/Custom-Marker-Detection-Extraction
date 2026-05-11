import { StyleSheet } from 'react-native';

export const Colors = {
    /* Base colors */
    bg: '#0B0D17',
    surface: '#151828',
    surfaceSubtle: 'rgba(255,255,255,0.05)',
    overlay: 'rgba(0,0,0,0.7)',
    border: 'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(99,102,241,0.3)',

    /* Accent colors */
    cyan: '#6366F1' /* Indigo primary */,
    cyanSemi: 'rgba(99,102,241,0.85)',
    green: '#10B981' /* Emerald success */,
    red: '#EF4444' /* Rose error */,
    yellow: '#F59E0B' /* Amber warning */,

    /* Text colors */
    white: '#FFFFFF',
    black: '#000000',
    muted: '#94A3B8',
    textTertiary: '#475569',

    /* Semantic colors */
    scanLine: '#6366F1',
    detectionBox: '#10B981',
    detectionBoxBg: 'rgba(16,185,129,0.1)',
    badgeCompleteBg: 'rgba(16,185,129,0.15)',
    badgePartialBg: 'rgba(239,68,68,0.12)',
} as const;

export const Typography = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    h1: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.muted,
        lineHeight: 22,
    },
    body: {
        fontSize: 16,
        color: Colors.white,
    },
    button: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.3,
    },
    caption: {
        fontSize: 12,
        color: Colors.muted,
    },
});

export const Layout = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    flex1Bg: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;
