import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View, Text, Card, Colors, LoaderScreen } from 'react-native-ui-lib';
import firestore from '@react-native-firebase/firestore';

const ReportView = () => {
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(true);

  const renderItem = ({ item, index }) => {
    const { code = '' } = item;
    return (
      <Card
        flex
        padding-10
        margin-4
        containerStyle={{
          backgroundColor: index % 2 === 0 ? Colors.primary : Colors.blue10,
        }}>
        <Text padding-10 white text60BO>
          {code.toString()}
        </Text>
      </Card>
    );
  };

  useEffect(() => {
    let userList = [];
    const subscriber = firestore()
      .collection('Users')
      .orderBy('timeStamp', 'desc')
      .limit(20)
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          querySnapshot.forEach((doc) => {
            const { code } = doc.data();
            userList.push({
              code,
              key: doc.id,
            });
          });
          setUsers(userList);
        }
        setUsers(userList);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  return (
    <View flex>
      <View marginB-10 padding-10 bg-primary>
        <Text text60 white>
          Danh sách bệnh nhân thêm gần đây
        </Text>
      </View>
      <FlatList
        data={users}
        extraData={users}
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
      {loading && (
        <LoaderScreen
          color={Colors.primary}
          message="Đang tải..."
          messageStyle={styles.paragraph}
          overlay
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    color: Colors.primary,
    textDecorationColor: 'yellow',
    textShadowColor: 'red',
    textShadowRadius: 1,
    margin: 24,
  },
});

export default ReportView;
