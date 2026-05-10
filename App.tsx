/* Main Application Entry Point */
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';

import { Layout } from '@/constants/appConstants';

export default function App(): React.ReactElement {
  return (
    <GestureHandlerRootView style={Layout.flex1}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
