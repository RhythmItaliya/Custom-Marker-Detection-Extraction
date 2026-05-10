import { StyleSheet } from 'react-native';

export const Colors = {
    /* Base colors */
    bg: '#08090B',
    surface: '#121418',
    surfaceSubtle: 'rgba(255,255,255,0.03)',
    overlay: 'rgba(0,0,0,0.65)',
    border: 'rgba(255,255,255,0.1)',
    borderAccent: 'rgba(0,242,255,0.2)',

    /* Accent colors */
    cyan: '#00F2FF',
    cyanSemi: 'rgba(0,242,255,0.85)',
    green: '#00FF9D',
    red: '#FF4D4D',
    yellow: '#FFD600',

    /* Text colors */
    white: '#FFFFFF',
    black: '#000000',
    muted: '#A0AEC0',
    textTertiary: '#4A5568',

    /* Semantic colors */
    scanLine: '#00F2FF',
    detectionBox: '#00FF9D',
    detectionBoxBg: 'rgba(0,255,157,0.08)',
    badgeCompleteBg: 'rgba(0,255,157,0.15)',
    badgePartialBg: 'rgba(255,77,77,0.12)',
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
