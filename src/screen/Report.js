import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { View, Text, Card, Colors } from 'react-native-ui-lib';
import firestore from '@react-native-firebase/firestore';

const ReportView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const renderItem = ({ item, index }) => {
    const { code = '' } = item;
    return (
      <Card
        flex
        padding-10
        margin-4
        containerStyle={{
          backgroundColor: index % 2 === 0 ? Colors.purple30 : Colors.blue30,
        }}>
        <Text padding-10 white>
          {code.toString()}
        </Text>
      </Card>
    );
  };

  useEffect(() => {
    const userList = [];
    const subscriber = firestore()
      .collection('Users')
      .limit(20)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc) => {
            const { code } = doc.data();
            userList.push({
              code,
              key: doc.id,
            });
          });
        }
        setUsers(userList);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />; // or a spinner
  }

  return (
    <View>
      <View padding-10 bg-primary>
        <Text text60 white>
          Danh sách bệnh nhân
        </Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(_, index) => `${index}`}
        renderItem={renderItem}
        refreshing={loading}
        ItemSeparatorComponent={() => (
          <View
            flex
            bg-gray10
            paddingH-4
            style={{
              height: 1,
            }}
          />
        )}
      />
    </View>
  );
};

export default ReportView;
