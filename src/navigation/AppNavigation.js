import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from '../Home';
import ReportScreen from '../Report';

import {colors} from '../util';

const navigationOptions = (title, navigation) => {
  return {
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerTitle: title,
  };
};

const Stack = createStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={({navigation}) => navigationOptions('Home', navigation)}
          component={HomeScreen}
        />
        <Stack.Screen
          name="Report"
          options={({navigation}) => navigationOptions('Báo cáo', navigation)}
          component={ReportScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigation;
