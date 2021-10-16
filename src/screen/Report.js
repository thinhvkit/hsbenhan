<<<<<<< HEAD:src/Report.js
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {View, Text, Card, Colors, LoaderScreen} from 'react-native-ui-lib';
=======
import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { View, Text, Card, Colors } from 'react-native-ui-lib';
>>>>>>> 9a88b1f (update library):src/screen/Report.js
import firestore from '@react-native-firebase/firestore';
import colors from '../src/util/colors';

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
<<<<<<< HEAD:src/Report.js
      .collectionGroup('Users')
      .orderBy('code')
=======
      .collection('Users')
>>>>>>> 9a88b1f (update library):src/screen/Report.js
      .limit(20)
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
<<<<<<< HEAD:src/Report.js
          querySnapshot.forEach(doc => {
            const {code} = doc.data();
            userList = [
              ...userList,
              {
                code,
                key: doc.id,
              },
            ];
=======
          querySnapshot.forEach((doc) => {
            const { code } = doc.data();
            userList.push({
              code,
              key: doc.id,
            });
>>>>>>> 9a88b1f (update library):src/screen/Report.js
          });
          setUsers(userList);
        }
<<<<<<< HEAD:src/Report.js

        console.log('userList', userList);
=======
        setUsers(userList);
>>>>>>> 9a88b1f (update library):src/screen/Report.js
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  return (
    <View flex>
      <View marginB-10 padding-10 bg-primary>
        <Text text60 white>
          Danh sách bệnh nhân
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
          color={colors.primary}
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
    color: colors.primary,
    textDecorationColor: 'yellow',
    textShadowColor: 'red',
    textShadowRadius: 1,
    margin: 24,
  },
});

export default ReportView;
