import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors } from '@/constants/theme';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fieldErrors).length > 0) {
        setFieldErrors(e.fieldErrors);
      } else {
        setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen subtitle="Cria a tua conta para guardares os teus documentos clínicos.">
      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
        error={fieldErrors.name?.[0]}
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="nome@exemplo.com"
        error={fieldErrors.email?.[0]}
      />
      <TextField
        label="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="Mínimo 8 caracteres"
        error={fieldErrors.password?.[0]}
        onSubmitEditing={handleSubmit}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title="Criar conta"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!name || !email || !password}
      />
      <Link href="/login" replace asChild>
        <Button title="Já tens conta? Entrar" variant="secondary" />
      </Link>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: { color: Colors.danger, textAlign: 'center' },
});
