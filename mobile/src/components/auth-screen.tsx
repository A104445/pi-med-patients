import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

import { Logo } from './logo';

type Props = PropsWithChildren<{ subtitle: string }>;

export function AuthScreen({ subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo width={190} />
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.form}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.xl,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: { alignItems: 'center', gap: Spacing.md },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  form: { gap: Spacing.md },
});
