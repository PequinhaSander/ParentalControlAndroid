import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

export const uploadFoto = async (uri) => {
  if (!uri) return null;

  const path = Platform.OS === 'android' ? uri : uri.replace('file://', '');
  const filename = `fotos/${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
  const ref = storage().ref(filename);

  try {
    const base64Data = await RNFetchBlob.fs.readFile(path, 'base64');
    await ref.putString(base64Data, 'base64', { contentType: 'image/jpeg' });
    const url = await ref.getDownloadURL();
    return url;
  } catch (err) {
    console.error('[FALHA NO UPLOAD]', err);
    return null;
  }
};
