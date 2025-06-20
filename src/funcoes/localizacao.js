// src/funcoes/localizacao.js
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation   from '@react-native-community/geolocation';
import firestore     from '@react-native-firebase/firestore';

export async function coletarLocalizacao() {
  /* ------------ permissões ------------ */
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Permissão de localização negada.');
    }
  }

  /* ------------ ponto de GPS ---------- */
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;

        resolve({
          latitude,
          longitude,
          accuracy,
          coletadoEm: firestore.FieldValue.serverTimestamp(), // <-- timestamp
        });
      },
      err => reject(new Error('Erro ao obter localização: ' + err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
