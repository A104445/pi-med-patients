import { getShareExtensionKey } from 'expo-share-intent';

// Quando a app é aberta através da extensão de partilha (iOS), o deep link
// traz `dataUrl=<scheme>ShareKey`. Redirecionamos para a raiz e o
// ShareIntentHandler trata da importação do ficheiro.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) return '/';
    return path;
  } catch {
    return '/';
  }
}
