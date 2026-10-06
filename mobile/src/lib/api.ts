import Constants from 'expo-constants';

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type AuthResponse = { token: string; user: User };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

// Em desenvolvimento, se EXPO_PUBLIC_API_URL não estiver definido, usa o mesmo
// IP da máquina que serve o Metro (assim funciona em dispositivos físicos na LAN).
function resolveBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:3000`;
}

export const API_URL = resolveBaseUrl();

async function request<T>(path: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      ...rest,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(`Não foi possível contactar o servidor (${API_URL}).`, 0);
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors: Record<string, string[]> = body.errors ?? {};
    const message = body.error ?? Object.values(fieldErrors).flat()[0] ?? 'Ocorreu um erro inesperado.';
    throw new ApiError(message, response.status, fieldErrors);
  }
  return body as T;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ user: { name, email, password } }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: (token: string) => request<void>('/auth/logout', { method: 'DELETE', token }),
  me: (token: string) => request<{ user: User }>('/me', { token }),
};
