import { Directory, File, Paths } from 'expo-file-system';
import { readAsStringAsync } from 'expo-file-system/legacy';

// Documentos PDF guardados localmente no dispositivo, separados por utilizador.
// Estrutura: <documents>/users/<userId>/pdfs/<id>.pdf + index.json com metadados.

export type StoredDocument = {
  id: string;
  title: string;
  fileName: string;
  size: number | null;
  receivedAt: string;
};

export type IncomingFile = {
  path: string;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

function userDir(userId: number) {
  const dir = new Directory(Paths.document, 'users', String(userId), 'pdfs');
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function indexFile(userId: number) {
  return new File(userDir(userId), 'index.json');
}

// Devolve sempre um File construído a partir do Directory (e não de uma string
// `uri`): no Expo Go a pasta da app tem caracteres codificados (%40, %2F) e
// reconstruir o caminho a partir da uri aponta para um ficheiro inexistente.
export function documentFile(userId: number, doc: StoredDocument) {
  return new File(userDir(userId), doc.fileName);
}

export async function listDocuments(userId: number): Promise<StoredDocument[]> {
  const file = indexFile(userId);
  if (!file.exists) return [];
  try {
    const docs: StoredDocument[] = JSON.parse(await file.text());
    return docs.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  } catch {
    return [];
  }
}

async function saveIndex(userId: number, docs: StoredDocument[]) {
  const file = indexFile(userId);
  if (!file.exists) file.create();
  file.write(JSON.stringify(docs));
}

export function isPdf(file: IncomingFile) {
  return file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.fileName ?? file.path);
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function titleFrom(fileName: string | null | undefined) {
  const name = decodeURIComponent(fileName ?? '').replace(/\.pdf$/i, '').trim();
  return name || 'Documento sem nome';
}

// Lê o ficheiro de origem em base64. No Expo Go as uris precisam de cuidado:
// - content:// (picker no Android): só a API nova suporta qualquer content provider;
// - file:// : a API legacy usa a uri tal como vem, enquanto `new File(uri)`
//   altera caminhos com caracteres codificados (%40, %2F) e o acesso é recusado.
function readSourceBase64(uri: string) {
  if (uri.startsWith('content://')) return new File(uri).base64();
  return readAsStringAsync(uri, { encoding: 'base64' });
}

/** Copia os PDFs recebidos (ex.: via partilha) para o armazenamento da app. */
export async function importDocuments(userId: number, files: IncomingFile[]): Promise<StoredDocument[]> {
  const dir = userDir(userId);
  const imported: StoredDocument[] = [];

  for (const incoming of files.filter(isPdf)) {
    const id = newId();
    const fileName = `${id}.pdf`;
    const target = new File(dir, fileName);
    const data = await readSourceBase64(incoming.path);
    target.create();
    target.write(data, { encoding: 'base64' });

    imported.push({
      id,
      title: titleFrom(incoming.fileName ?? incoming.path.split('/').pop()),
      fileName,
      size: incoming.size ?? target.size ?? null,
      receivedAt: new Date().toISOString(),
    });
  }

  if (imported.length > 0) {
    const existing = await listDocuments(userId);
    await saveIndex(userId, [...imported, ...existing]);
  }
  return imported;
}

export async function getDocument(userId: number, id: string) {
  const docs = await listDocuments(userId);
  return docs.find((doc) => doc.id === id) ?? null;
}

export async function deleteDocument(userId: number, id: string) {
  const docs = await listDocuments(userId);
  const doc = docs.find((d) => d.id === id);
  if (!doc) return;

  const file = new File(userDir(userId), doc.fileName);
  if (file.exists) file.delete();
  await saveIndex(userId, docs.filter((d) => d.id !== id));
}
