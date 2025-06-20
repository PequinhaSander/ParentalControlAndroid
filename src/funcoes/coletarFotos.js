import { NativeModules } from 'react-native';

const { PhotosModule } = NativeModules;

export const coletarFotos = async () => {
  try {
    const fotos = await PhotosModule.getPhotos();
    return { fotos };
  } catch (err) {
    console.error('[ERRO COLETAR FOTOS]', err.message);
    return { fotos: [] };
  }
};
