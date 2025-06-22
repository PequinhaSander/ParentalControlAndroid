import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Alert } from 'react-native';

const { NotificacaoRN } = NativeModules;

export async function garantirPermissaoNotificacao() {
  if (Platform.OS !== 'android') return true;

  const enabled = await NotificacaoRN.isEnabled();
  if (enabled) return true;

  return new Promise(resolve => {
    Alert.alert(
      'Permissão necessária',
      'Para capturar mensagens do WhatsApp é preciso ativar ' +
        'o acesso a notificações. Deseja abrir as configurações agora?',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Sim',
          onPress: () => {
            NotificacaoRN.openSettings();
            resolve(false); // usuário deve ativar manualmente
          },
        },
      ],
    );
  });
}

/* (Opcional) assinar eventos “ao vivo” */
export function listenNovaNotificacao(callback) {
  const emitter = new NativeEventEmitter(NotificacaoRN);
  const sub = emitter.addListener('NovaNotificacao', callback);
  return () => sub.remove();
}
