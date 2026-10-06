# Medgical Patients

> *Your Medical Data. Your Control.*

Aplicação móvel (iOS e Android) para cada pessoa receber, organizar e transportar os seus dados médicos.

| Pasta | Stack |
| --- | --- |
| [`mobile/`](mobile) | React Native com Expo SDK 57 (Expo Router, TypeScript) |
| [`backend/`](backend) | Ruby on Rails 8.1 (modo API) + PostgreSQL |

## Funcionalidades atuais

- **Autenticação**: registo, login e logout. O backend emite um token de sessão (guardado só como digest SHA-256 na base de dados); a app guarda-o no `expo-secure-store` (Keychain/Keystore).
- **Receber PDFs por partilha**: em qualquer app (Ficheiros, Gmail, browser…) → *Partilhar* → **Medgical Patients**. O PDF é copiado para o armazenamento da app, separado por utilizador, e aberto de imediato.
- **Adicionar PDF**: botão para escolher PDFs do dispositivo (funciona também no Expo Go).
- **Ver documentos**: lista dos PDFs e visualizador integrado (WebView + pdf.js, carregado do cdnjs; precisa de internet). Toque longo num documento para o apagar.

Se partilhares um PDF sem sessão iniciada, o ficheiro fica pendente e é importado logo a seguir ao login.

## Correr em desenvolvimento

Atalho: `./run.sh` arranca o backend e o Metro para o **Expo Go** (lê o QR code). Outras opções: `dev` (development build já instalada), `android`/`ios` (compila e instala) ou `backend`. Arranca o Rails em background, prepara a base de dados, instala dependências se faltarem e para o backend ao sair.

### Backend

```bash
cd backend
bundle install
bin/rails db:prepare db:seed
bin/rails server -b 0.0.0.0   # -b 0.0.0.0 para o telemóvel conseguir aceder
bin/rails test
```

Em desenvolvimento há um utilizador de demonstração (criado por `bin/rails db:seed`): **demo@medgical.ai** / **demo1234**.

Endpoints (`/api/v1`): `POST auth/register`, `POST auth/login`, `DELETE auth/logout`, `GET me` (cabeçalho `Authorization: Bearer <token>`).

### Mobile

Tudo funciona no **Expo Go** exceto receber PDFs via *Partilhar* de outras apps, que exige um módulo nativo e por isso uma *development build*:

```bash
cd mobile
npm install
npx expo run:android        # requer Android SDK; ou:
npx expo run:ios            # requer macOS + Xcode
# alternativa sem toolchain local:
npx eas-cli@latest build --profile development
```

Depois da primeira build, basta `npx expo start` para desenvolver.

Por omissão a app fala com `http://<IP do Metro>:3000`, ou seja, com o Rails a correr na mesma máquina. Para usar outro servidor define `EXPO_PUBLIC_API_URL` (ex.: num ficheiro `mobile/.env.local`).

### Logo

`mobile/assets/brand/logo-patients.svg` é o logo Medgical original com "Patients" por baixo, do mesmo tamanho e com a espessura do "gical" (fonte Ubuntu, peso 550, convertida em paths). Na app é desenhado com `react-native-svg` ([`src/components/logo.tsx`](mobile/src/components/logo.tsx)).
