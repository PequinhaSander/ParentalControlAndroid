import { NativeModules } from 'react-native';

export const coletarAppsInstalados = async () => {
  try {
    const { InstalledApps } = NativeModules;
    const apps = await InstalledApps.getInstalledApps();
    return { apps };
  } catch (error) {
    console.error('[ERRO coletarAppsInstalados]', error);
    return { apps: [] };
  }
};
