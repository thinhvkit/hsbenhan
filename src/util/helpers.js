import ImagePicker from 'react-native-image-picker';

export const selectPhotoTapped = (callback, onlyTake = false) => {
  const options = {
    quality: 0.9,
    tintColor: 'black',
    title: 'Chọn hình ảnh',
    takePhotoButtonTitle: 'Chụp ảnh',
    chooseFromLibraryButtonTitle: 'Chọn hình ảnh từ thư viện',
    storageOptions: {
      skipBackup: true,
      path: 'images',
      cameraRoll: true,
    },
  };

  if (onlyTake) {
    ImagePicker.launchCamera(options, callback);
  } else {
    ImagePicker.showImagePicker(options, callback);
  }
};
