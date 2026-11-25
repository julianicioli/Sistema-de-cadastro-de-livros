import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import ListaObrasScreen from './src/screens/ListaObrasScreen';
import FormObraScreen from './src/screens/FormObraScreen';
import DetalheObraScreen from './src/screens/DetalheObraScreen';
import { cores } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: cores.cabecalho },
          headerTintColor: cores.texto,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Stack.Screen name="Lista" component={ListaObrasScreen} options={{ title: '✦ Minhas Leituras' }} />
        <Stack.Screen name="Detalhe" component={DetalheObraScreen} options={{ title: 'Progresso' }} />
        <Stack.Screen name="Form" component={FormObraScreen} options={{ title: 'Nova obra' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
