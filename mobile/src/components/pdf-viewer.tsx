import { File } from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Colors } from '@/constants/theme';

// Visualizador de PDF em WebView com pdf.js. Não precisa de módulos nativos
// extra, por isso funciona no Expo Go e em builds próprias (iOS e Android).
const PDFJS_VERSION = '6.4.299';
const PDFJS_ORIGIN = 'https://cdnjs.cloudflare.com/';
const PDFJS_BASE = `${PDFJS_ORIGIN}ajax/libs/pdf.js/${PDFJS_VERSION}`;

type Props = {
  file: File;
  onPageChanged?: (current: number, total: number) => void;
  onError?: (message: string) => void;
};

type ViewerMessage =
  | { type: 'loaded'; pages: number }
  | { type: 'page'; current: number; pages: number }
  | { type: 'error'; message: string };

function buildHtml(base64: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
<style>
  html, body { margin: 0; padding: 0; background: ${Colors.background}; }
  #pages { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 12px 0 72px; }
  canvas { background: #fff; box-shadow: 0 1px 4px rgba(15, 27, 42, 0.18); max-width: calc(100vw - 24px); }
</style>
</head>
<body>
<div id="pages"></div>
<script type="module">
  const post = (msg) => window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  try {
    const pdfjs = await import('${PDFJS_BASE}/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = '${PDFJS_BASE}/pdf.worker.min.mjs';

    const raw = atob('${base64}');
    const data = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);

    const pdf = await pdfjs.getDocument({ data }).promise;
    post({ type: 'loaded', pages: pdf.numPages });

    const container = document.getElementById('pages');
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssWidth = window.innerWidth - 24;
    const canvases = [];

    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = cssWidth + 'px';
      canvas.dataset.page = n;
      container.appendChild(canvas);
      canvases.push(canvas);
      await page.render({ canvas, viewport }).promise;
    }

    let last = 0;
    const onScroll = () => {
      const middle = window.scrollY + window.innerHeight / 2;
      const current = canvases.findIndex((c) => c.offsetTop + c.offsetHeight >= middle) + 1 || canvases.length;
      if (current !== last) {
        last = current;
        post({ type: 'page', current, pages: pdf.numPages });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  } catch (e) {
    post({ type: 'error', message: String(e && e.message ? e.message : e) });
  }
</script>
</body>
</html>`;
}

export function PdfViewer({ file, onPageChanged, onError }: Props) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    file
      .base64()
      .then((data) => {
        if (!cancelled) setHtml(buildHtml(data));
      })
      .catch((e) => onError?.(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [file, onError]);

  function handleMessage(event: WebViewMessageEvent) {
    const msg: ViewerMessage = JSON.parse(event.nativeEvent.data);
    if (msg.type === 'loaded') onPageChanged?.(1, msg.pages);
    else if (msg.type === 'page') onPageChanged?.(msg.current, msg.pages);
    else onError?.(msg.message);
  }

  if (!html) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <WebView
      // A origem do cdnjs permite carregar o worker do pdf.js sem problemas de CORS.
      source={{ html, baseUrl: PDFJS_ORIGIN }}
      originWhitelist={['*']}
      onMessage={handleMessage}
      style={styles.webview}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: Colors.background },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
