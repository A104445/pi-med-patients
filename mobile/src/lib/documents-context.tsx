import { createContext, use, useCallback, useEffect, useState, type PropsWithChildren } from 'react';

import {
  deleteDocument,
  importDocuments,
  listDocuments,
  type IncomingFile,
  type StoredDocument,
} from './documents';

type DocumentsState = {
  documents: StoredDocument[];
  isLoading: boolean;
  importFiles: (files: IncomingFile[]) => Promise<StoredDocument[]>;
  remove: (id: string) => Promise<void>;
};

const DocumentsContext = createContext<DocumentsState | null>(null);

export function useDocuments() {
  const value = use(DocumentsContext);
  if (!value) throw new Error('useDocuments tem de ser usado dentro de <DocumentsProvider>');
  return value;
}

export function DocumentsProvider({ userId, children }: PropsWithChildren<{ userId: number }>) {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setDocuments(await listDocuments(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    listDocuments(userId).then((docs) => {
      if (cancelled) return;
      setDocuments(docs);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const value: DocumentsState = {
    documents,
    isLoading,
    async importFiles(files) {
      const imported = await importDocuments(userId, files);
      await reload();
      return imported;
    },
    async remove(id) {
      await deleteDocument(userId, id);
      await reload();
    },
  };

  return <DocumentsContext value={value}>{children}</DocumentsContext>;
}
