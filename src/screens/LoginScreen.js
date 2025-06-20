import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const fazerLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email.trim(), senha);
      navigation.replace('Home');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        Alert.alert('Erro', 'Usuário não encontrado. Crie uma conta.');
      } else {
        Alert.alert('Erro ao logar', e.message);
      }
    }
  };

  const criarConta = async () => {
    try {
      await auth().createUserWithEmailAndPassword(email.trim(), senha);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Erro ao criar conta', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Controle Parental</Text>
      
      <TextInput
        placeholder="E-mail"
        autoCapitalize="none"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <Button title="Fazer Login" onPress={fazerLogin} />
      <View style={{ height: 10 }} />
      <Button title="Criar Conta" onPress={criarConta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
});
