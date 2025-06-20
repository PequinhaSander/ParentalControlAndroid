import { PermissionsAndroid, Platform, Alert } from 'react-native';
import CallLogs from 'react-native-call-log';

export async function pegarRegistroChamadas(setChamadas, setStatus) {
  try {
    setStatus('Verificando permissão para chamadas...');

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        {
          title: 'Permissão de Registro de Chamadas',
          message: 'Precisamos acessar seu histórico de chamadas para monitoramento.',
          buttonPositive: 'Permitir',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permissão Negada', 'Sem permissão para acessar chamadas.');
        setStatus('Permissão negada para chamadas.');
        return;
      }
    }

    setStatus('Obtendo registro de chamadas...');
    const registros = await CallLogs.loadAll();

    setChamadas(registros);
    setStatus('Chamadas obtidas com sucesso.');
  } catch (error) {
    console.error('[ERRO AO OBTER CHAMADAS]', error);
    setStatus('Erro ao obter chamadas.');
  }
}
