import './src/lib/dayjs';
import { StatusBar } from 'react-native';
import { Loading } from './src/components/Loading';
import { Routes } from './src/routes';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

// No React-native o flexblox já é ativo por padrão
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#09090A',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     color: '#7C3AED',
//     fontSize: 32,
//     fontFamily: 'Inter_800ExtraBold',
//   },
// });

export default function App() {
  // useFonts é um hook
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <>
      <Routes />
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
    </>
  );
}
