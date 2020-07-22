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
  TextField,
  Button,
  TouchableOpacity,
  AnimatedImage,
} from 'react-native-ui-lib';
import firestore from '@react-native-firebase/firestore';
import ImageViewing from 'react-native-image-viewing';
import colors from '../src/util/colors';
import CaptureImageView from '../src/CaptureImages';

const Home = (props) => {
  const [showCaptureImage, setShowCaptureImage] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentImageIndex, setImageIndex] = useState(0);

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity flex paddingH-4 onPress={() => openImageViewing(index)}>
        <AnimatedImage
          containerStyle={{backgroundColor: colors.bluish, marginBottom: 10}}
          style={{resizeMode: 'cover', height: 250}}
          source={item}
          loader={<ActivityIndicator />}
          key={index}
          animationDuration={index === 0 ? 300 : 800}
        />
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
      const list = [];
      const user = await firestore()
        .collection('Users')
        .where('code', 'array-contains', searchText)
        .get();
      console.log(user.size);
      user.forEach((documentSnapshot) => {
        list.push(documentSnapshot.data());
      });
      setData(list);
      setIsLoading(false);
    }
  };

  const openImageViewing = (index) => {
    if (_.isEmpty(data)) {
      return;
    }
    setImageIndex(index);
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
            height: '100%',
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
          }}
          centered
          multiline={false}
          enableErrors={false}
          onChangeText={onChangeSearchText}
        />
        <View row paddingT-15>
          <Button
            backgroundColor="#f1f1f1"
            blue30
            marginH-5
            marginV-20
            size="small"
            label="Tìm"
            borderRadius={10}
            labelStyle={{letterSpacing: 1}}
            outline
            onPress={onSearch}
          />
          <Button
            backgroundColor="#f1f1f1"
            blue30
            marginH-5
            marginV-20
            size="small"
            label="Thêm hình ảnh"
            borderRadius={10}
            labelStyle={{letterSpacing: 1}}
            outline
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
        images={data}
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
