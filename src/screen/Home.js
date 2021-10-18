import React, { useState, useLayoutEffect } from 'react';
import { FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import _ from 'lodash';
import {
  View,
  Text,
  TextField,
  Button,
  TouchableOpacity,
  AnimatedImage,
  Colors,
} from 'react-native-ui-lib';
import firestore from '@react-native-firebase/firestore';
import ImageViewing from 'react-native-image-viewing';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../utils/common'

const Home = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [imagesViewing, setImagesViewing] = useState([]);
  const [currentImageIndex, setImageIndex] = useState(0);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingEnd: 10 }}
          onPress={() => {
            navigation.navigate('Report');
          }}>
          <Icon name="md-information-circle-outline" size={30} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderItem = ({ item, index }) => {
    const { code = '', uri } = item;
    return (
      <TouchableOpacity
        flex
        padding-6
        onPress={() => openImageViewing(item, index)}>
        <AnimatedImage
          containerStyle={{ backgroundColor: Colors.blue60, marginBottom: 10, borderRadius: 10 }}
          style={{ resizeMode: 'cover', height: 250 }}
          source={{ uri }}
          loader={<ActivityIndicator />}
          key={index}
          animationDuration={index === 0 ? 300 : 800}
        />
        <Text padding-10 center>{code.toString()}</Text>
      </TouchableOpacity>
    );
  };

  const onShowCapturePhoto = () => {
    navigation.navigate('Capture');
  };

  const onChangeSearchText = text => {
    setSearchText(text);
  };

  const onSearch = async () => {
    if (searchText.length > 0) {
      setIsLoading(true);
      setData([]);

      firestore()
        .collection('Users')
        .where('code', 'array-contains', searchText.toLowerCase())
        .get()
        .then(querySnapshot => {
          setIsLoading(false);
          querySnapshot.forEach((documentSnapshot) => {
            const d = documentSnapshot.data();
            setData(preData => [...preData, ..._.map(d.images, (uri) => ({ code: d.code, uri }))]);
          });
        }).catch((err) => {
          setIsLoading(false);
          console.log(err);
        });

    }
  };

  const openImageViewing = (item, index) => {
    setImageIndex(0);
    setImagesViewing([{ uri: item.uri }]);
    setIsViewing(true);
  };

  const onRequestClose = () => setIsViewing(false);

  const renderEmptyContainer = () => {
    return (
      <View center>
        <Text gray40>Không tìm thấy bệnh nhân</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View centerV paddingH-10 paddingV-10 marginB-10>
        <TextField
          key={'centered'}
          placeholder={'Tìm kiếm'}
          placeholderTextColor={Colors.white}
          white
          underlineColor={{
            focus: Colors.primary,
            error: Colors.yellow,
          }}
          style={{
            backgroundColor: Colors.grey10,
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
          }}
          multiline={false}
          enableErrors={false}
          onChangeText={onChangeSearchText}
        />
        <View row paddingT-15>
          <Button
            backgroundColor={Colors.orange10}
            white10
            marginH-5
            marginV-20
            size="medium"
            label="Tìm"
            borderRadius={10}
            labelStyle={{ letterSpacing: 1 }}
            onPress={onSearch}
          />
          <Button
            backgroundColor={Colors.orange10}
            white10
            marginH-5
            marginV-20
            size="medium"
            label="Thêm hình ảnh"
            borderRadius={10}
            labelStyle={{ letterSpacing: 1 }}
            onPress={onShowCapturePhoto}
          />
        </View>
      </View>

      <FlatList
        row
        numColumns={2}
        data={data}
        keyExtractor={(_, index) => `${index}`}
        renderItem={renderItem}
        refreshing={isLoading}
        ListEmptyComponent={renderEmptyContainer()}
      />

      <ImageViewing
        images={imagesViewing}
        imageIndex={currentImageIndex}
        presentationStyle="fullScreen"
        visible={isViewing}
        backgroundColor={Colors.grey60}
        onRequestClose={onRequestClose}
      />
    </SafeAreaView>
  );
};

export default Home;
