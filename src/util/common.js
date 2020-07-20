import {StyleSheet} from 'react-native';
import colors from './colors';

export default StyleSheet.create({
  roundedDialog: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'flex-end',
    marginBottom: 0,
    marginHorizontal: 0,
    marginTop: 40,
  },
  removeImage: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  button: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    marginHorizontal: 4,
    alignSelf: 'center',
  },
});
