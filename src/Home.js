import React, {useState} from 'react';
import {StyleSheet, FlatList, Image, PixelRatio} from 'react-native';
import _ from 'lodash';
import {View, TextField, Button, TouchableOpacity} from 'react-native-ui-lib';
import storage from '@react-native-firebase/storage';
import ImageViewing from 'react-native-image-viewing';
import colors from '../src/util/colors';
import CaptureImageView from '../src/CaptureImages';

const Home = (props) => {
  const [showCaptureImage, setShowCaptureImage] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={openImageViewing}>
        <Image style={{width: 200, height: 200}} source={item} />
      </TouchableOpacity>
    );
  };

  const onShowCaptureImage = () => {
    if (searchText.length >= 4) {
      setShowCaptureImage(true);
    }
  };

  const listFilesAndDirectories = (reference, pageToken) => {
    return reference.list({pageToken}).then((result) => {
      const uris = [];
      result.items.forEach(async (ref) => {
        console.log(ref.fullPath);
        const uri = await storage().ref(ref.fullPath).getDownloadURL();
        uris.push({uri});
      });
      setData(uris);

      if (result.nextPageToken) {
        return listFilesAndDirectories(result.nextPageToken);
      }

      return Promise.resolve();
    });
  };

  const onChangeSearchText = (text) => {
    setSearchText(text);
  };

  const onSearch = () => {
    if (searchText.length >= 4) {
      setIsLoading(true);
      const reference = storage().ref(searchText);
      listFilesAndDirectories(reference).then(() => {
        console.log('Finished listing');
        setIsLoading(false);
      });
    }
  };

  const openImageViewing = () => {
    if (_.isEmpty(data)) {
      return;
    }
    setIsViewing(true);
  };

  return (
    <View>
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
          data={data}
          keyExtractor={(item, index) => `${index}`}
          renderItem={renderItem}
          refreshing={isLoading}
          onRefresh={onSearch}
        />
      </View>

      <CaptureImageView
        visible={showCaptureImage}
        item={searchText}
        hideDialog={() => setShowCaptureImage(false)}
      />
      <ImageViewing
        images={data}
        imageIndex={0}
        visible={isViewing}
        backgroundColor="#fff"
        onRequestClose={() => setIsViewing(false)}
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
