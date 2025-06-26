import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Para ícones bonitos nas abas

// Importe suas telas
import { AtletasScreen } from './screens/AtletasScreen';
// Em breve criaremos e importaremos as outras:
// import { SessoesScreen } from './screens/SessoesScreen';
// import { FinancasScreen } from './screens/FinancasScreen';
// import { HistoricoScreen } from './screens/HistoricoScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Atletas') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Sessões') {
              iconName = focused ? 'basketball' : 'basketball-outline';
            } else if (route.name === 'Finanças') {
              iconName = focused ? 'cash' : 'cash-outline';
            } else if (route.name === 'Histórico') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            }

            // Você pode retornar qualquer componente que queira aqui!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato', // Cor do ícone e texto da aba ativa
          tabBarInactiveTintColor: 'gray', // Cor do ícone e texto da aba inativa
          headerShown: false, // Oculta o cabeçalho padrão das telas (vamos criar os nossos próprios cabeçalhos mais tarde)
        })}
      >
        <Tab.Screen name="Atletas" component={AtletasScreen} />
        {/* Adicionaremos as outras telas aqui depois de criá-las */}
        {/* <Tab.Screen name="Sessões" component={SessoesScreen} /> */}
        {/* <Tab.Screen name="Finanças" component={FinancasScreen} /> */}
        {/* <Tab.Screen name="Histórico" component={HistoricoScreen} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}