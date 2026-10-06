import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar sessão.');
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen subtitle="Your Medical Data. Your Control.">
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="nome@exemplo.com"
      />
      <TextField
        label="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSubmit}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Entrar" onPress={handleSubmit} loading={submitting} disabled={!email || !password} />
      <Link href="/register" replace asChild>
        <Button title="Ainda não tens conta? Criar conta" variant="secondary" />
      </Link>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: { color: Colors.danger, textAlign: 'center' },
});
