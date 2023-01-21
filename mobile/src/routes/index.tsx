import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { AppRoutes } from './app.routes';

export function Routes() {
  // Aparece na transição entre as telas para não mostrar um fundo branco
  return (
    <View className="flex-1 bg-background">
      <NavigationContainer>
        <AppRoutes /> 
      </NavigationContainer>
    </View>
  );
}
