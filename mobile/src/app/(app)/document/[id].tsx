import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PdfViewer } from '@/components/pdf-viewer';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { documentFile } from '@/lib/documents';
import { useDocuments } from '@/lib/documents-context';

export default function DocumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { documents, isLoading } = useDocuments();
  const [page, setPage] = useState({ current: 1, total: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);

  const doc = documents.find((d) => d.id === id);
  const file = useMemo(() => (doc && user ? documentFile(user.id, doc) : null), [doc, user]);
  const handlePageChanged = useCallback((current: number, total: number) => setPage({ current, total }), []);

  if (isLoading) {
    return <ActivityIndicator style={styles.center} color={Colors.primary} />;
  }

  if (!doc || !file) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Documento' }} />
        <Text style={styles.message}>Documento não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: doc.title }} />
      {loadError ? (
        <View style={styles.center}>
          <Text style={styles.message}>Não foi possível abrir o PDF.</Text>
          <Text style={styles.detail}>{loadError}</Text>
        </View>
      ) : (
        <PdfViewer
          file={file}
          onPageChanged={handlePageChanged}
          onError={setLoadError}
        />
      )}
      {page.total > 0 && (
        <View style={styles.pageIndicator} pointerEvents="none">
          <Text style={styles.pageText}>
            {page.current} / {page.total}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pdf: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.sm },
  message: { fontSize: 16, color: Colors.text },
  detail: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  pageIndicator: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(9, 52, 86, 0.85)',
  },
  pageText: { color: Colors.onPrimary, fontSize: 13, fontWeight: '600' },
});
