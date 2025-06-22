/*  ------------------------------------------------------------
    coleta os contatos usando o módulo Kotlin ContatoModule
------------------------------------------------------------- */
import { PermissionsAndroid, Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { ContatoModule } = NativeModules;     // <-- exposto pelo Package

export async function coletarContatos() {
  /* ----- pede permissão se for Android >= 23 ---------------- */
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const ok = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    );
    if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Permissão READ_CONTACTS negada');
    }
  }

  /* ----- chama o módulo nativo ------------------------------ */
  const contatos = await ContatoModule.getContatos();

  /*  contatos vem como array de objetos { nome, telefone }     */
  return { contatos };             // padronizo retorno igual aos demais
}
