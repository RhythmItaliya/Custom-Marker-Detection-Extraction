/* Shared bottom navigation tab bar */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/appConstants';

interface Tab {
    key: string;
    label: string;
    icon: React.ComponentType<any>;
}

interface BottomTabBarProps {
    tabs: Tab[];
    activeKey: string;
    onPress: (key: string) => void;
}

export function BottomTabBar({
    tabs,
    activeKey,
    onPress,
}: BottomTabBarProps): React.ReactElement {
    return (
        <View style={styles.root}>
            {tabs.map(tab => {
                const active = tab.key === activeKey;
                const IconComponent = tab.icon;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => onPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <IconComponent
                            size={20}
                            color={active ? Colors.cyan : Colors.muted}
                            strokeWidth={active ? 2.5 : 2}
                        />
                        <Text
                            style={[styles.label, active && styles.labelActive]}
                        >
                            {tab.label}
                        </Text>
                        {active && <View style={styles.indicator} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
        paddingBottom: Platform.OS === 'android' ? Spacing.md : Spacing.xxl,
        paddingTop: Spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
        paddingVertical: Spacing.xs,
        position: 'relative',
    },
    icon: {
        fontSize: 20,
        color: Colors.muted,
    },
    iconActive: {
        color: Colors.cyan,
    },
    label: {
        ...Typography.caption,
        fontSize: 10,
        letterSpacing: 0.5,
        fontWeight: '500',
    },
    labelActive: {
        color: Colors.cyan,
        fontWeight: '700',
    },
    indicator: {
        position: 'absolute',
        top: 0,
        width: 28,
        height: 2,
        borderRadius: 1,
        backgroundColor: Colors.cyan,
    },
});
