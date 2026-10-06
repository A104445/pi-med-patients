import * as DocumentPicker from 'expo-document-picker';
import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Logo } from '@/components/logo';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import type { StoredDocument } from '@/lib/documents';
import { useDocuments } from '@/lib/documents-context';

const dateFormatter = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' });

function formatSize(bytes: number | null) {
  if (bytes == null) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentRow({ doc, onLongPress }: { doc: StoredDocument; onLongPress: () => void }) {
  const meta = [dateFormatter.format(new Date(doc.receivedAt)), formatSize(doc.size)].filter(Boolean).join(' · ');
  return (
    <Link href={{ pathname: '/document/[id]', params: { id: doc.id } }} asChild>
      <Pressable
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityHint="Toque longo para apagar">
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PDF</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {doc.title}
          </Text>
          <Text style={styles.cardMeta}>{meta}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Ainda não tens documentos</Text>
      <Text style={styles.emptyText}>
        Toca em Adicionar PDF ou, noutra app (Ficheiros, email, browser…), usa Partilhar e escolhe Medgical
        Patients. O documento aparece aqui.
      </Text>
    </View>
  );
}

export default function DocumentsScreen() {
  const { user, signOut } = useAuth();
  const { documents, isLoading, remove, importFiles } = useDocuments();
  const [picking, setPicking] = useState(false);

  async function pickPdf() {
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        // No Android usamos o content:// original: no Expo Go a cópia para cache
        // fica numa pasta fora do âmbito da app e não pode ser lida.
        copyToCacheDirectory: Platform.OS !== 'android',
        multiple: true,
      });
      if (result.canceled) return;

      const imported = await importFiles(
        result.assets.map((asset) => ({
          path: asset.uri,
          fileName: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
        })),
      );
      if (imported.length === 1) {
        router.push({ pathname: '/document/[id]', params: { id: imported[0].id } });
      }
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível adicionar o documento.');
    } finally {
      setPicking(false);
    }
  }

  function confirmDelete(doc: StoredDocument) {
    Alert.alert('Apagar documento', `Queres apagar "${doc.title}" deste dispositivo?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => remove(doc.id) },
    ]);
  }

  function confirmSignOut() {
    Alert.alert('Terminar sessão', 'Queres sair da tua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <Logo width={84} />,
          headerRight: () => (
            <Pressable onPress={confirmSignOut} hitSlop={12} accessibilityRole="button">
              <Text style={styles.headerAction}>Sair</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={documents}
        keyExtractor={(doc) => doc.id}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Olá, {user?.name.split(' ')[0]}</Text>
            <Text style={styles.sectionTitle}>Os teus documentos</Text>
            <Button title="Adicionar PDF" onPress={pickPdf} loading={picking} style={styles.addButton} />
          </View>
        }
        ListEmptyComponent={isLoading ? null : EmptyState}
        renderItem={({ item }) => <DocumentRow doc={item} onLongPress={() => confirmDelete(item)} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md, gap: Spacing.sm, flexGrow: 1 },
  header: { gap: Spacing.xs, marginBottom: Spacing.sm },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.text },
  sectionTitle: { fontSize: 15, color: Colors.textSecondary },
  addButton: { marginTop: Spacing.sm },
  headerAction: { color: Colors.primary, fontSize: 16, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: { backgroundColor: Colors.background },
  badge: {
    width: 44,
    height: 52,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 12 },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  cardMeta: { fontSize: 13, color: Colors.textSecondary },
  empty: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
});
