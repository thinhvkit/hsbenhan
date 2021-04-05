import * as ImagePicker from 'react-native-image-picker';

export const selectPhotoTapped = (callback, onlyTake = false) => {
  const options = {
    mediaType: 'photo',
    includeBase64: false,
  };

  if (onlyTake) {
    ImagePicker.launchCamera(options, callback);
  } else {
    ImagePicker.launchImageLibrary(options, callback);
  }
};
