import CallLogs from 'react-native-call-log';
import { PermissionsAndroid, Platform } from 'react-native';

export async function coletarChamadas() {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('[CHAMADAS] Permissão negada');
        return { chamadas: 'Permissão negada' };
      }
    }

    const logs = await CallLogs.loadAll();
    const chamadasFormatadas = logs.slice(0, 10).map(chamada => ({
      numero: chamada.phoneNumber,
      tipo: chamada.type, // 1 = recebida, 2 = discada, 3 = perdida
      data: chamada.timestamp,
      duracao: chamada.duration,
      nome: chamada.name,
    }));

    return { chamadas: chamadasFormatadas };
  } catch (error) {
    console.error('[CHAMADAS] Erro ao coletar chamadas:', error);
    return { chamadas: 'Erro ao coletar chamadas' };
  }
}
