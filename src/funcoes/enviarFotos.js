import { uploadFoto } from './uploadFotos';

export const enviarFotosParaFirebase = async (fotos = []) => {
  const urls = [];

  for (const uri of fotos) {
    try {
     
      const url = await uploadFoto(uri);
      if (url) {
        urls.push(url);
     
      }
    } catch (err) {
    
    }
  }

  return urls;
};
