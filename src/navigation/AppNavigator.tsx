import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
    CameraScreen,
    ResultsScreen,
    HistoryScreen,
    TestScreen,
} from '@/screens';
import { RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.ReactElement {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Camera"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Camera" component={CameraScreen} />
                <Stack.Screen name="Results" component={ResultsScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Test" component={TestScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
