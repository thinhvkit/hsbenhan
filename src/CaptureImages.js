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
import {View, Button, TextField, Toast} from 'react-native-ui-lib';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import {selectPhotoTapped} from '../src/util/helpers';

import colors from '../src/util/colors';
import common from '../src/util/common';

const CaptureImagesView = (props) => {
  const {visible, hideDialog} = props;
  const [images, setImages] = useState();
  const [code, setCode] = useState();
  const [errCode, setErrCode] = useState();
  const [fullName, setFullName] = useState();
  const [errFullName, setErrFullName] = useState();
  const [showTopToast, setShowTopToast] = useState(false);
  const [messageToast, setMessageToast] = useState('');

  const flatList = React.createRef();

  const callback = (response) => {
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

  const onRemoveImage = (index) => {
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
          selectPhotoTapped(callback);
        }}>
        <Icon name="md-add-circle" color={colors.primary} size={30} />
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
    return _.isEmpty(images) || _.isEmpty(code) || _.isEmpty(fullName);
  };
  const onPushImage = async () => {
    if (validate()) {
      return;
    }

    images.map((i) => {
      const reference = storage().ref(`/${code}/${i.name}`);
      const pathToFile = i.uri;
      const task = reference.putFile(pathToFile);
      task.on('state_changed', (taskSnapshot) => {
        console.log(taskSnapshot);
      });

      task.then((taskSnapshot) => {
        console.log('Image uploaded to the bucket!', taskSnapshot);
        storage()
          .ref(taskSnapshot.metadata.fullPath)
          .getDownloadURL()
          .then((url) => {
            const usersRef = firestore()
              .collection('Users')
              .doc(code.toLowerCase());

            firestore().runTransaction(async (transaction) => {
              // Get user data first
              const userSnapshot = await transaction.get(usersRef);
              if (userSnapshot.exists) {
                transaction.update(usersRef, {
                  code: firestore.FieldValue.arrayUnion(fullName.toLowerCase()),
                  images: firestore.FieldValue.arrayUnion(url),
                });
                console.log('User updated!');
              } else {
                transaction.set(usersRef, {
                  code: [code.toLowerCase(), fullName.toLowerCase()],
                  images: [url],
                });
                console.log('User added!'); // create the document
              }
            });
          });
      });
    });
    hideDialog();
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
      backdropOpacity={0.3}>
      <View style={styles.container}>
        <View row spread marginB-40 marginT-10>
          <TextField
            containerStyle={{flex: 1, paddingHorizontal: 6}}
            key={'code'}
            floatingPlaceholder
            floatOnFocus
            placeholder="Mã HS"
            underlineColor={{
              focus: colors.primary,
              error: colors.yellow,
            }}
            multiline={false}
            onChangeText={onChangeCodeText}
            error={errCode}
            useTopErrors
          />
          <TextField
            containerStyle={{flex: 1, paddingHorizontal: 6}}
            key={'fullname'}
            floatingPlaceholder
            placeholder="Họ tên_năm sinh"
            helperText="Viết thường không dấu"
            underlineColor={{
              focus: colors.primary,
              error: colors.yellow,
            }}
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

        <View row margin-10 center>
          <Button
            orange10
            marginH-5
            marginV-20
            size="large"
            label="OK"
            borderRadius={10}
            labelStyle={{letterSpacing: 1}}
            outline
            outlineColor={colors.yellow}
            onPress={onPushImage}
          />
        </View>
        <Button
          style={{position: 'absolute', top: -30, right: 0}}
          backgroundColor="#ffffff"
          orange10
          marginH-5
          size="small"
          label="Đóng"
          borderRadius={4}
          labelStyle={{letterSpacing: 1}}
          outline
          outlineColor={colors.yellow}
          onPress={hideDialog}
          iconSource={(iconStyle) => (
            <Icon
              name="md-arrow-back-circle"
              size={20}
              color={iconStyle[0].tintColor}
            />
          )}
        />
        <Toast
          visible={showTopToast}
          position={'top'}
          message={messageToast}
          onDismiss={() => setShowTopToast(false)}
          showDismiss={true}
        />
      </View>
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
});

export default compose(
  connect(
    (state) => ({}),
    (dispatch) => ({}),
  ),
)(CaptureImagesView);
