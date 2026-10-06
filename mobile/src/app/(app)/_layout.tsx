import { router, Stack } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { DocumentsProvider, useDocuments } from '@/lib/documents-context';

// Importa os PDFs partilhados para a app assim que há sessão iniciada.
function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();
  const { importFiles } = useDocuments();
  const importing = useRef(false);

  useEffect(() => {
    if (error) Alert.alert('Erro na partilha', error);
  }, [error]);

  useEffect(() => {
    if (!hasShareIntent || importing.current) return;
    importing.current = true;

    (async () => {
      try {
        const imported = await importFiles(shareIntent.files ?? []);
        if (imported.length === 0) {
          Alert.alert('Ficheiro não suportado', 'De momento só é possível adicionar documentos PDF.');
        } else if (imported.length === 1) {
          router.push({ pathname: '/document/[id]', params: { id: imported[0].id } });
        } else {
          router.dismissTo('/');
        }
      } catch (e) {
        Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível importar o documento.');
      } finally {
        resetShareIntent();
        importing.current = false;
      }
    })();
  }, [hasShareIntent, shareIntent, importFiles, resetShareIntent]);

  return null;
}

export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DocumentsProvider userId={user.id}>
      <ShareIntentHandler />
      <Stack
        screenOptions={{
          headerTintColor: Colors.primary,
          headerStyle: { backgroundColor: Colors.surface },
          headerTitleStyle: { color: Colors.text },
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Documentos' }} />
        <Stack.Screen name="document/[id]" options={{ title: '' }} />
      </Stack>
    </DocumentsProvider>
  );
}
