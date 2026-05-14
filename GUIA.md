# 🚗 CarUn — Guia Completo de Instalação, Execução e Testes

---

## 📁 ESTRUTURA DE ARQUIVOS

Antes de começar, organize seus arquivos assim:

```
carun/
├── src/
│   ├── firebase-backend.js     ← backend (Firebase)
│   ├── carun-frontend.jsx      ← frontend (React)
│   └── carun.test.js           ← testes
├── index.html
├── package.json
├── vite.config.js
└── .env
```

---

## PASSO 1 — INSTALAR O NODE.JS

O Node.js é o ambiente que roda o React e os testes no seu computador.

1. Acesse: https://nodejs.org
2. Baixe a versão **LTS** (recomendada)
3. Instale normalmente (next, next, finish)
4. Verifique a instalação abrindo o terminal e digitando:

```bash
node --version
# deve aparecer algo como: v20.x.x

npm --version
# deve aparecer algo como: 10.x.x
```

> **Windows:** use o Terminal, PowerShell ou Git Bash
> **Mac:** use o Terminal
> **Linux:** use o Terminal

---

## PASSO 2 — CRIAR O PROJETO REACT COM VITE

O Vite é a ferramenta que transforma seu código React em algo que o navegador entende.

Abra o terminal, navegue até uma pasta de sua preferência e rode:

```bash
# Cria o projeto
npm create vite@latest carun -- --template react

# Entra na pasta criada
cd carun

# Instala as dependências base do React
npm install
```

---

## PASSO 3 — INSTALAR AS DEPENDÊNCIAS DO PROJETO

Ainda dentro da pasta `carun`, instale o Firebase e o Vitest (para testes):

```bash
# Firebase (banco de dados + autenticação)
npm install firebase

# Vitest (framework de testes) + Testing Library (para testes de componente)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## PASSO 4 — COPIAR OS ARQUIVOS DO PROJETO

Substitua (ou copie) os arquivos gerados pelo Vite pelos seus:

```
# Copie cada arquivo para dentro da pasta src/
carun/src/firebase-backend.js   ← firebase-backend.js
carun/src/App.jsx               ← carun-frontend.jsx  (renomeie para App.jsx)
carun/src/carun.test.js         ← carun.test.js
```

Edite também o `carun/index.html` para ter o elemento root:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CarUn</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

O arquivo `src/main.jsx` (gerado pelo Vite) deve estar assim:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## PASSO 5 — CONFIGURAR O FIREBASE

### 5.1 — Criar o projeto no Firebase

1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Dê o nome **CarUn** e clique em continuar
4. Desative o Google Analytics (não precisa) e crie o projeto
5. Na tela do projeto, clique no ícone **`</>`** (Web) para registrar o app
6. Dê um apelido (ex: `carun-web`) e clique em **Registrar app**
7. Copie o objeto `firebaseConfig` que aparece na tela — você vai precisar dele

### 5.2 — Ativar Autenticação

1. No menu lateral, clique em **Authentication**
2. Clique em **Começar**
3. Na aba **Sign-in method**, clique em **E-mail/senha**
4. Ative a primeira opção e salve

### 5.3 — Ativar o Firestore (banco de dados)

1. No menu lateral, clique em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Iniciar no modo de teste** (por enquanto)
4. Escolha a região **southamerica-east1 (São Paulo)** e clique em Ativar

### 5.4 — Configurar as Regras de Segurança

1. No Firestore, clique na aba **Regras**
2. Apague tudo que está lá e cole as regras que estão comentadas no final do `firebase-backend.js`
3. Clique em **Publicar**

### 5.5 — Colocar o firebaseConfig no projeto

Crie o arquivo `.env` na raiz do projeto (`carun/.env`):

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

Agora edite o início do `firebase-backend.js` para usar as variáveis de ambiente:

```js
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
```

> ⚠️ **Importante:** nunca suba o arquivo `.env` para o GitHub.
> Adicione ao `.gitignore`: `.env`

---

## PASSO 6 — CONFIGURAR O VITE E O VITEST

Substitua o conteúdo de `vite.config.js` por:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Configuração dos testes
  test: {
    globals:     true,        // permite usar describe/it/expect sem importar
    environment: 'jsdom',     // simula o navegador durante os testes
    setupFiles:  './src/setupTests.js',
  },
})
```

Crie o arquivo `src/setupTests.js`:

```js
import '@testing-library/jest-dom'
```

---

## PASSO 7 — CONFIGURAR O PACKAGE.JSON

Abra o `package.json` e adicione os scripts de teste:

```json
{
  "name": "carun",
  "version": "1.0.0",
  "scripts": {
    "dev":          "vite",
    "build":        "vite build",
    "preview":      "vite preview",
    "test":         "vitest run",
    "test:watch":   "vitest",
    "test:ui":      "vitest --ui",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "firebase": "^10.x.x",
    "react":    "^18.x.x",
    "react-dom": "^18.x.x"
  },
  "devDependencies": {
    "@testing-library/jest-dom":  "^6.x.x",
    "@testing-library/react":     "^14.x.x",
    "@vitejs/plugin-react":       "^4.x.x",
    "jsdom":                      "^24.x.x",
    "vitest":                     "^1.x.x"
  }
}
```

---

## PASSO 8 — RODAR A APLICAÇÃO

### Rodar em desenvolvimento (modo local)

```bash
npm run dev
```

O terminal vai mostrar algo como:

```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra o navegador em **http://localhost:5173** e o app estará funcionando.

Para parar: pressione `Ctrl + C` no terminal.

---

## PASSO 9 — RODAR OS TESTES

Você tem 4 formas de rodar os testes:

### 9.1 — Rodar uma vez e ver o resultado

```bash
npm run test
```

Saída esperada:

```
 ✓ src/carun.test.js (33 testes)

   🔐 Autenticação (7)
     ✓ deve cadastrar usuário e criar perfil no Firestore
     ✓ deve lançar erro quando e-mail já está em uso
     ✓ deve fazer login com credenciais corretas
     ✓ deve lançar erro com senha incorreta
     ✓ deve fazer logout com sucesso
     ✓ deve alterar senha após reautenticação bem-sucedida
     ✓ deve lançar erro ao alterar senha com senha atual incorreta

   👤 Perfil do Usuário (3)
     ✓ deve retornar o perfil quando o usuário existe
     ✓ deve retornar null quando usuário não existe
     ✓ deve atualizar campos do perfil corretamente

   🚗 Caronas (7)
     ✓ deve publicar uma carona e retornar o ID gerado
     ✓ deve buscar caronas ativas e retornar lista
     ✓ deve filtrar caronas por gênero corretamente
     ✓ deve filtrar caronas por preço máximo
     ✓ deve filtrar caronas por origem
     ✓ deve retornar lista vazia quando não há caronas
     ✓ deve escutar caronas em tempo real via onSnapshot

   📋 Solicitações de Carona (3)
     ✓ deve criar uma solicitação com status 'pending'
     ✓ deve atualizar status para 'accepted'
     ✓ deve atualizar status para 'rejected'

   💬 Chat (4)
     ✓ deve gerar chatId determinístico e ordenado
     ✓ deve enviar mensagem e atualizar metadados do chat
     ✓ deve escutar mensagens em tempo real
     ✓ não deve enviar mensagem vazia

   ⭐ Avaliações (3)
     ✓ deve registrar avaliação e recalcular média do perfil
     ✓ deve calcular corretamente a primeira avaliação
     ✓ não deve atualizar média se o perfil não existir

   ✅ Validações de Negócio (6)
     ✓ getChatId deve ser simétrico com qualquer par de UIDs
     ✓ getChatId não deve ser o mesmo para pares diferentes
     ✓ deve incluir 'active: true' ao criar uma carona
     ✓ deve incluir timestamp ao criar carona
     ✓ deve incluir timestamp ao criar solicitação
     ✓ deve incluir todos os campos obrigatórios ao cadastrar usuário

 Test Files  1 passed (1)
 Tests       33 passed (33)
 Duration    1.20s
```

---

### 9.2 — Modo watch (reexecuta ao salvar um arquivo)

```bash
npm run test:watch
```

Ideal enquanto você está desenvolvendo: cada vez que salvar um arquivo,
os testes rodam automaticamente.

---

### 9.3 — Interface visual no navegador

```bash
# Instale o pacote da UI primeiro (só precisa fazer uma vez)
npm install --save-dev @vitest/ui

# Rode
npm run test:ui
```

Abre em **http://localhost:51204** uma interface bonita com todos os testes,
onde você vê quais passaram (verde) e quais falharam (vermelho).

---

### 9.4 — Ver cobertura de código (coverage)

```bash
# Instale o pacote de coverage primeiro (só precisa fazer uma vez)
npm install --save-dev @vitest/coverage-v8

# Rode
npm run test:coverage
```

Mostra uma tabela informando qual % do seu código está coberto por testes:

```
 % Stmts  % Branch  % Funcs  % Lines  Arquivo
   92.3     88.1      100      93.4    firebase-backend.js
```

---

## RESUMO DOS COMANDOS

| O que fazer                        | Comando               |
|------------------------------------|-----------------------|
| Iniciar o app no navegador         | `npm run dev`         |
| Rodar todos os testes (uma vez)    | `npm run test`        |
| Rodar testes enquanto desenvolve   | `npm run test:watch`  |
| Ver testes na interface visual     | `npm run test:ui`     |
| Ver cobertura de código            | `npm run test:coverage` |
| Gerar build para produção          | `npm run build`       |

---

## SOLUÇÃO DE PROBLEMAS COMUNS

**Erro: "Cannot find module 'firebase/...'"**
```bash
npm install firebase
```

**Erro: "vite: command not found"**
```bash
npm install
```

**Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"**
→ Verifique se o `firebaseConfig` no `.env` está preenchido corretamente.

**Testes passam mas o app não conecta ao Firebase**
→ Os testes usam mocks (simulações) do Firebase, então passam sem internet.
→ Para o app funcionar de verdade, o `.env` precisa estar correto.

**Porta 5173 já está em uso**
→ O Vite automaticamente tenta a próxima porta disponível (5174, 5175...).
→ Ou encerre o processo que está usando a porta e rode `npm run dev` novamente.
