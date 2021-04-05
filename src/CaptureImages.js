import React, {useState} from 'react';
import {compose} from 'recompose';
import {connect} from 'react-redux';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  PixelRatio,
  FlatList,
} from 'react-native';
import _ from 'lodash';
import {
  View,
  Button,
  TextField,
  Toast,
  Colors,
  LoaderScreen,
} from 'react-native-ui-lib';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import {selectPhotoTapped} from '../src/util/helpers';

import colors from '../src/util/colors';
import common from '../src/util/common';

const CaptureImagesView = props => {
  const {visible, hideDialog} = props;
  const [images, setImages] = useState();
  const [code, setCode] = useState();
  const [errCode, setErrCode] = useState();
  const [fullName, setFullName] = useState();
  const [errFullName, setErrFullName] = useState();
  const [showTopToast, setShowTopToast] = useState(false);
  const [messageToast, setMessageToast] = useState('');
  const [loading, setLoading] = useState(false);

  const flatList = React.createRef();

  const callback = response => {
    if (response.didCancel) {
      console.log('User cancelled photo picker');
      setMessageToast('User cancelled photo picker');
      setShowTopToast(true);
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
      setMessageToast(response.error);
      setShowTopToast(true);
    } else {
      const getFilename = response.uri.split('/');

      const imgName = getFilename[getFilename.length - 1];
      const image = {
        name: imgName,
        type: response.type,
        uri: response.uri,
      };
      if (images) {
        setImages([...images, image]);
      } else {
        setImages([image]);
      }
    }
  };

  const onRemoveImage = index => {
    images.splice(index, 1);
    setImages([...images]);
  };

  const renderImage = (item, index) => {
    return (
      <View style={styles.imageContainer}>
        <Image style={{width: 200, height: 200}} source={{uri: item.uri}} />
        <TouchableOpacity
          onPress={() => {
            onRemoveImage(index);
          }}
          style={styles.removeImage}>
          <Icon name="md-close-sharp" color={colors.primary} size={30} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddImage = () => {
    return (
      <TouchableOpacity
        style={[{width: 100, height: 100}, styles.imageContainer]}
        onPress={() => {
          selectPhotoTapped(callback, true);
        }}>
        <Icon name="md-add-circle" color={colors.primary} size={30} />
      </TouchableOpacity>
    );
  };

  const onChangeCodeText = text => {
    setErrCode(text ? undefined : 'Bắt buộc nhập');
    setCode(text);
  };
  const onChangeFullNameText = text => {
    setFullName(text);
  };

  const onClear = () => {
    setImages();
    setCode();
    setFullName();
  };

  const validate = () => {
    return _.isEmpty(images) || _.isEmpty(code);
  };
  const onPushImage = async () => {
    if (validate()) {
      return;
    }

    setLoading(true);
    images.map(i => {
      const reference = storage().ref(`/${code}/${i.name}`);
      const pathToFile = i.uri;
      const task = reference.putFile(pathToFile);
      task.on('state_changed', taskSnapshot => {
        console.log(taskSnapshot);
      });

      task.then(taskSnapshot => {
        console.log('Image uploaded to the bucket!', taskSnapshot);
        storage()
          .ref(taskSnapshot.metadata.fullPath)
          .getDownloadURL()
          .then(url => {
            const usersRef = firestore()
              .collection('Users')
              .doc(code.toLowerCase());

            firestore().runTransaction(async transaction => {
              // Get user data first
              const userSnapshot = await transaction.get(usersRef);
              if (userSnapshot.exists) {
                transaction.update(usersRef, {
                  code: firestore.FieldValue.arrayUnion(fullName.toLowerCase()),
                  images: firestore.FieldValue.arrayUnion(url),
                  timeStamp: firestore.Timestamp.now(),
                });
                console.log('User updated!');
                setMessageToast('Cập nhật thành công');
                setShowTopToast(true);
              } else {
                const codeStr = [code.toLowerCase()];
                if (!_.isEmpty(fullName)) {
                  codeStr.push(fullName.toLowerCase());
                }
                transaction.set(usersRef, {
                  code: codeStr,
                  images: [url],
                });
                setMessageToast('Thêm thành công');
                setShowTopToast(true);
                console.log('User added!'); // create the document
              }
              onClear();
            });
            setLoading(false);
          })
          .catch(error => {
            setMessageToast('Lỗi thêm hình ảnh');
            setShowTopToast(true);
            setLoading(false);
          });
      });
    });
  };

  const onModalHide = () => {
    setImages([]);
    setCode();
    setErrCode();
    setFullName();
    setErrFullName();
  };

  return (
    <Modal
      style={common.roundedDialog}
      isVisible={visible}
      onModalHide={onModalHide}
      backdropOpacity={0.3}
      onSwipeCancel={hideDialog}
      onBackdropPress={hideDialog}>
      <View style={styles.container}>
        <View marginB-40>
          <TextField
            containerStyle={{paddingHorizontal: 6}}
            key={'code'}
            floatingPlaceholder
            floatingPlaceholderColor={Colors.orange10}
            floatOnFocus
            placeholder="Mã HS"
            underlineColor={{
              focus: colors.primary,
              error: colors.yellow,
            }}
            value={code}
            multiline={false}
            onChangeText={onChangeCodeText}
            error={errCode}
            useTopErrors
          />
          <TextField
            containerStyle={{marginTop: 10, paddingHorizontal: 6}}
            key={'fullname'}
            floatingPlaceholder
            floatingPlaceholderColor={Colors.orange10}
            placeholder="Họ Tên_Năm sinh"
            underlineColor={{
              focus: colors.primary,
              error: colors.yellow,
            }}
            value={fullName}
            multiline={false}
            onChangeText={onChangeFullNameText}
            error={errFullName}
            useTopErrors
          />
        </View>
        <FlatList
          data={images || []}
          keyExtractor={(item, index) => `${index}`}
          renderItem={({item, index}) => renderImage(item, index)}
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
            labelStyle={{letterSpacing: 1}}
            backgroundColor={Colors.orange10}
            disabled={loading}
            onPress={onPushImage}
          />
        </View>
        <Toast
          visible={showTopToast}
          position={'top'}
          message={messageToast}
          onDismiss={() => setShowTopToast(false)}
          showDismiss={true}
          autoDismiss={2000}
        />
      </View>
      {loading && (
        <LoaderScreen
          color={colors.primary}
          message="Đang tải..."
          messageStyle={styles.paragraph}
          overlay
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 40,
    marginBottom: 4,
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
  paragraph: {
    color: colors.primary,
    textDecorationColor: 'yellow',
    textShadowColor: 'red',
    textShadowRadius: 1,
    margin: 24,
  },
});

export default compose(
  connect(
    state => ({}),
    dispatch => ({}),
  ),
)(CaptureImagesView);
