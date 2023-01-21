import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';
import { useNavigation } from '@react-navigation/native';

// Por padrão o React Native desconhece SVG
import Logo from '../assets/logo.svg';

export function Header() {
  const { navigate } = useNavigation();

  return (
    <View className="w-full flex-row items-center justify-between">
      <Logo />

      {/* Lida com o toque do usuário na tela */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row h-11 px-4 border border-violet-500 rounded-lg items-center"
        onPress={() => navigate('new')}>
        {/* Para acessar estilização do tailwind em um contexto que não é um className usamos a importação "colors" */}
        <Feather name="plus" color={colors.violet[500]} size={20} />

        <Text className="text-white ml-3 font-semibold text-base">Novo</Text>
      </TouchableOpacity>
    </View>
  );
}
