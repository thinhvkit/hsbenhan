// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from 'react-native-ui-lib';

import { loadConfigurations } from '../utils/configurations'
import HomeScreen from '../screen/Home'
import ReportScreen from '../screen/Report'
import CapturePhoto from '../screen/Capture';

loadConfigurations();

const navigationOptions = (title) => {
  return {
    headerStyle: {
      backgroundColor: Colors.primary,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerTitle: title,
  };
};

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Home" options={() => navigationOptions('Hồ Sơ Bệnh Án')} component={HomeScreen} />
          <Stack.Screen name="Report" options={() => navigationOptions('Báo cáo')} component={ReportScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Capture" options={() => navigationOptions('Chụp hình')} component={CapturePhoto} />
        </Stack.Group>
      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;