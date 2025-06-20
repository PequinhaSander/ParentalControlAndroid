import { uploadFoto } from './uploadFotos';

export const enviarFotosParaFirebase = async (fotos = []) => {
  const urls = [];

  for (const uri of fotos) {
    try {
      console.log('[UPLOAD] Enviando:', uri);
      const url = await uploadFoto(uri);
      if (url) {
        urls.push(url);
        console.log('[SUCESSO] URL gerada:', url);
      }
    } catch (err) {
      console.error('[ERRO NO UPLOAD]', err);
    }
  }

  return urls;
};
