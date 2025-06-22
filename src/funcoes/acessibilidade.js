// src/funcoes/acessibilidade.js
import { NativeModules, Platform, Linking } from 'react-native';

const { AcessibilidadeHelper } = NativeModules; // pode não existir (depende de você ter criado)

export async function abrirTelaAcessibilidade() {
  if (Platform.OS !== 'android') return;

  /* 1. Se você criou o módulo nativo (AcessibilidadeHelper) use-o */
  if (AcessibilidadeHelper?.abrirConfiguracoesAcessibilidade) {
    AcessibilidadeHelper.abrirConfiguracoesAcessibilidade();
    return;
  }

  /* 2. Fallback via Intent (Linking) */
  try {
    await Linking.openSettings(); // abre a tela de ajustes do app
    await Linking.openURL('android.settings.ACCESSIBILITY_SETTINGS');
  } catch (e) {
    console.warn('Não foi possível abrir as Configurações de Acessibilidade:', e);
  }
}
