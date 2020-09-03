import React, {useState} from 'react';
import {
  StyleSheet,
  FlatList,
  PixelRatio,
  ActivityIndicator,
} from 'react-native';
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
import colors from '../src/util/colors';
import CaptureImageView from '../src/CaptureImages';

const Home = (props) => {
  const [showCaptureImage, setShowCaptureImage] = useState(false);
  const [data, setData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [imagesViewing, setImagesViewing] = useState([]);
  const [currentImageIndex, setImageIndex] = useState(0);

  const renderItem = ({item, index}) => {
    const {code = '', uri} = item;
    return (
      <TouchableOpacity
        flex
        paddingH-4
        onPress={() => openImageViewing(item, index)}>
        <AnimatedImage
          containerStyle={{backgroundColor: colors.bluish, marginBottom: 10}}
          style={{resizeMode: 'cover', height: 250}}
          source={{uri}}
          loader={<ActivityIndicator />}
          key={index}
          animationDuration={index === 0 ? 300 : 800}
        />
        <Text padding-10>{code.toString()}</Text>
      </TouchableOpacity>
    );
  };

  const onShowCaptureImage = () => {
    setShowCaptureImage(true);
  };

  const onChangeSearchText = (text) => {
    setSearchText(text);
  };

  const onSearch = async () => {
    if (searchText.length > 0) {
      setIsLoading(true);
      setData([]);
      let list = [];
      try {
        const user = await firestore()
          .collection('Users')
          .where('code', 'array-contains', searchText.toLowerCase())
          .get();

        setIsLoading(false);
        user.forEach((documentSnapshot) => {
          const d = documentSnapshot.data();
          list = [...list, ..._.map(d.images, (i) => ({code: d.code, uri: i}))];
        });
        setData(list);
      } catch (err) {
        setIsLoading(false);
        console.log(err);
      }
    }
  };

  const openImageViewing = (item, index) => {
    setImageIndex(0);
    setImagesViewing([{uri: item.uri}]);
    setIsViewing(true);
  };

  const onRequestClose = () => setIsViewing(false);

  return (
    <View>
      {isLoading && (
        <ActivityIndicator
          style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}
          size="large"
          color={colors.primary}
        />
      )}
      <View centerV paddingH-10 paddingV-10 marginB-10>
        <TextField
          key={'centered'}
          placeholder={'Tìm kiếm'}
          underlineColor={{
            focus: colors.primary,
            error: colors.yellow,
          }}
          style={{
            backgroundColor: colors.bluish,
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
            labelStyle={{letterSpacing: 1}}
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
            labelStyle={{letterSpacing: 1}}
            onPress={onShowCaptureImage}
          />
        </View>
      </View>

      <View>
        <FlatList
          row
          numColumns={2}
          data={data}
          keyExtractor={(item, index) => `${index}`}
          renderItem={renderItem}
          refreshing={isLoading}
          onRefresh={onSearch}
        />
      </View>

      <CaptureImageView
        visible={showCaptureImage}
        hideDialog={() => setShowCaptureImage(false)}
      />
      <ImageViewing
        images={imagesViewing}
        imageIndex={currentImageIndex}
        presentationStyle="overFullScreen"
        visible={isViewing}
        backgroundColor="#fff"
        onRequestClose={onRequestClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 5,
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
});

export default Home;
