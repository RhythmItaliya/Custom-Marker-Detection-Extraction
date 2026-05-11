import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/appConstants';

import { ChevronLeft } from 'lucide-react-native';

interface AppHeaderProps {
    title: string;
    onBack?: () => void;
    rightLabel?: string;
    rightIcon?: React.ComponentType<any>;
    onRight?: () => void;
    rightColor?: string;
}

export function AppHeader({
    title,
    onBack,
    rightLabel,
    rightIcon: RightIcon,
    onRight,
    rightColor = Colors.cyan,
}: AppHeaderProps): React.ReactElement {
    return (
        <View style={styles.root}>
            {onBack ? (
                <TouchableOpacity
                    onPress={onBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backBtn}
                >
                    <ChevronLeft color={Colors.cyan} size={28} />
                    <Text style={styles.back}>Back</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.spacer} />
            )}

            <Text style={styles.title}>{title}</Text>

            {(rightLabel || RightIcon) && onRight ? (
                <TouchableOpacity
                    onPress={onRight}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.rightBtn}
                >
                    {RightIcon && <RightIcon color={rightColor} size={20} />}
                    {rightLabel && (
                        <Text
                            style={[
                                styles.right,
                                {
                                    color: rightColor,
                                    marginLeft: RightIcon ? 6 : 0,
                                },
                            ]}
                        >
                            {rightLabel}
                        </Text>
                    )}
                </TouchableOpacity>
            ) : (
                <View style={styles.spacer} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...Layout.rowBetween,
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: Colors.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
    },
    back: {
        ...Typography.subtitle,
        color: Colors.cyan,
        fontWeight: '600',
        marginLeft: 2,
    },
    title: {
        ...Typography.title,
        letterSpacing: 0.3,
    },
    rightBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 80,
    },
    right: {
        ...Typography.subtitle,
        fontWeight: '600',
    },
    spacer: { width: 80 },
});
