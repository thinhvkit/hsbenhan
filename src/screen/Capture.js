import React, { useState, useCallback } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  PixelRatio,
  FlatList,
} from 'react-native';
import _ from 'lodash';
import { View, Button, TextField, Toast, Colors } from 'react-native-ui-lib';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import { launchCamera } from 'react-native-image-picker';

const CaptureView = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [code, setCode] = useState();
  const [errCode, setErrCode] = useState();
  const [fullName, setFullName] = useState();
  const [errFullName, setErrFullName] = useState();
  const [showTopToast, setShowTopToast] = useState(false);
  const [messageToast, setMessageToast] = useState('');

  const flatList = React.createRef();

  const callback = useCallback((response) => {
    if (response.didCancel) {
      setMessageToast('User cancelled photo picker');
      setShowTopToast(true);
    } else if (response.errorMessage) {
      setMessageToast(response.errorMessage);
      setShowTopToast(true);
    } else {
      if (response?.assets) {
        setPhotos(prevItems => [...prevItems, ...response.assets]);
      }
    }
  }, []);

  const takePhoto = useCallback(() => {
    launchCamera({
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.6
    }, callback)
  }, []);

  const onRemoveImage = (index) => {
    photos.splice(index, 1);
    setPhotos([...photos]);
  };

  const renderImage = ({ uri }, index) => {
    return (
      <View style={styles.imageContainer}>
        <Image style={{ width: 200, height: 200 }} source={{ uri }} />
        <TouchableOpacity
          onPress={() => {
            onRemoveImage(index);
          }}
          style={styles.removeImage}>
          <Icon name="md-close-sharp" color={Colors.primary} size={30} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddImage = () => {
    return (
      <TouchableOpacity
        style={[{ width: 100, height: 100 }, styles.imageContainer]}
        onPress={() => {
          takePhoto();
        }}>
        <Icon name="md-add-circle" color={Colors.primary} size={30} />
      </TouchableOpacity>
    );
  };

  const onChangeCodeText = (text) => {
    setErrCode(text ? undefined : 'Bắt buộc nhập');
    setCode(text);
  };
  const onChangeFullNameText = (text) => {
    setErrFullName(text ? undefined : 'Bắt buộc nhập');
    setFullName(text);
  };

  const validate = () => {
    return _.isEmpty(photos) || _.isEmpty(code) || _.isEmpty(fullName);
  };
  const onPushImage = async () => {
    if (validate()) {
      return;
    }

    photos.map((i) => {
      const reference = storage().ref(`/${code}/${i.name}`);
      const pathToFile = i.uri;
      const task = reference.putFile(pathToFile);
      task.on('state_changed', (_) => {
        console.log('State change');
      });

      task.then((taskSnapshot) => {
        console.log('Image uploaded to the bucket!');
        storage()
          .ref(taskSnapshot.metadata.fullPath)
          .getDownloadURL()
          .then((url) => {
            const usersRef = firestore()
              .collection('Users')
              .doc(code.toLowerCase());

            firestore().runTransaction(async (transaction) => {
              const userSnapshot = await transaction.get(usersRef);
              if (userSnapshot.exists) {
                transaction.update(usersRef, {
                  code: firestore.FieldValue.arrayUnion(fullName.toLowerCase()),
                  images: firestore.FieldValue.arrayUnion(url),
                  timeStamp: firestore.FieldValue.serverTimestamp(),
                });
              } else {
                transaction.set(usersRef, {
                  code: [code.toLowerCase(), fullName.toLowerCase()],
                  images: [url],
                  timeStamp: firestore.FieldValue.serverTimestamp(),
                });
              }
            });
          });
      });
    });
    navigation.goBack();
  };

  return (

    <View style={styles.container}>
      <View marginB-40>
        <TextField
          containerStyle={{ paddingHorizontal: 6 }}
          key={'code'}
          floatingPlaceholder
          floatingPlaceholderColor={Colors.orange10}
          floatOnFocus
          placeholder="Mã HS"
          underlineColor={{
            focus: Colors.primary,
            error: Colors.yellow,
          }}
          multiline={false}
          onChangeText={onChangeCodeText}
          error={errCode}
          useTopErrors
        />
        <TextField
          containerStyle={{ marginTop: 10, paddingHorizontal: 6 }}
          key={'fullname'}
          floatingPlaceholder
          floatingPlaceholderColor={Colors.orange10}
          placeholder="Họ Tên_Năm sinh"
          underlineColor={{
            focus: Colors.primary,
            error: Colors.yellow,
          }}
          multiline={false}
          onChangeText={onChangeFullNameText}
          error={errFullName}
          useTopErrors
        />
      </View>
      <FlatList
        data={photos}
        extraData={photos}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item, index }) => renderImage(item, index)}
        ref={flatList}
        onContentSizeChange={() => flatList.current.scrollToEnd()}
        ListFooterComponent={renderAddImage}
      />

      <View row marginH-15 marginV-20 center>
        <Button
          flex
          white10
          size="large"
          label="OK"
          borderRadius={10}
          labelStyle={{ letterSpacing: 1 }}
          backgroundColor={Colors.orange10}
          onPress={onPushImage}
        />
      </View>
      <Toast
        visible={showTopToast}
        position={'top'}
        message={messageToast}
        onDismiss={() => setShowTopToast(false)}
        showDismiss={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
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
  removeImage: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default compose(
  connect(
    (state) => ({}),
    (dispatch) => ({}),
  ),
)(CaptureView);
