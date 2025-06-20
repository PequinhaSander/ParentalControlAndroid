import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';

export default function StartScreen({ navigation }) {
  useEffect(() => {
    const unsub = auth().onAuthStateChanged(user => {
      if (user) navigation.replace('Home');
      else navigation.replace('Login');
    });
    return unsub;
  }, []);

  return null; // tela vazia enquanto decide
}
