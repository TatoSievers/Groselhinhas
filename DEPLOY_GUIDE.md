# Guia de Deploy e Configuração (Groselhinhas)

Siga este guia para criar sua conta no Google Firebase (Banco de Dados/Login) e publicar seu site no Vercel.

---

## Parte 1: Configurar o Google Firebase (Banco de Dados e Login)

O Firebase vai guardar as listas de filmes e permitir o login com o Google. É **gratuito**.

1.  Acesse [console.firebase.google.com](https://console.firebase.google.com/) e faça login com sua conta Google.
2.  Clique em **"Adicionar projeto"** (ou "Create a project").
    *   **Nome**: `groselhinhas-app` (ou o que preferir).
    *   **Google Analytics**: Pode desativar se quiser simplificar, ou deixar ativado. Clique em "Continuar/Criar".
3.  Quando o projeto estiver pronto, clique em **"Continuar"**.

### 1.1 Habilitar o Banco de Dados (Firestore)
1.  No menu lateral esquerdo, clique em **"Criação"** (Build) -> **"Firestore Database"**.
2.  Clique em **"Criar banco de dados"** (Create database).
3.  **Localização**: Escolha uma próxima de você (ex: `nam5 (us-central)` ou `sao-paulo` se houver, mas `us-central` é padrão e funciona bem).
4.  **Regras de Segurança**: Escolha **"Iniciar no modo de teste"** (Start in test mode) por enquanto.
5.  Clique em **"Criar"** (ou "Enable").

### 1.2 Habilitar o Login (Authentication)
1.  No menu lateral esquerdo, clique em **"Criação"** -> **"Authentication"**.
2.  Clique em **"Vamos começar"** (Get started).
3.  Na aba **"Sign-in method"**, clique em **"Google"**.
4.  Clique no botão de **Ativar** (Enable) no canto superior direito.
5.  **Nome do projeto**: Deixe como está.
6.  **E-mail de suporte**: Selecione o seu e-mail.
7.  Clique em **"Salvar"**.

### 1.3 Pegar as Chaves de Acesso (Configuração)
1.  No menu lateral esquerdo, clique na **Engrenagem** (⚙️) ao lado de "Visão geral do projeto" -> **"Configurações do projeto"** (Project settings).
2.  Role até o final da página onde diz **"Seus aplicativos"**.
3.  Clique no ícone **</>** (Web) para criar um app web.
4.  **Apelido do app**: `Groselhinhas Web`.
5.  Clique em **"Registrar app"**.
6.  Vai aparecer um código chamando `firebaseConfig`. **COPIE** o conteúdo dentro das chaves `{ ... }`. Será parecido com isso:
    ```javascript
    apiKey: "AIzaSy...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
    ```
7.  **Guarde isso**, vamos usar no Vercel.

---

## Parte 2: Publicar no Vercel (Hospedagem)

O Vercel vai colocar seu site no ar.

1.  Acesse [vercel.com](https://vercel.com/) e crie uma conta (pode usar o GitHub, GitLab ou E-mail).
2.  Instale o **Vercel CLI** no seu computador (terminal):
    ```bash
    npm i -g vercel
    ```
3.  No terminal, dentro da pasta do projeto `groselhinhas`, rode:
    ```bash
    vercel
    ```
4.  Responda às perguntas:
    *   Set up and deploy? **Y**
    *   Which scope? (Selecione sua conta)
    *   Link to existing project? **N**
    *   Project name? `groselhinhas`
    *   In which directory? `./` (apenas Enter)
    *   Want to modify settings? **N**
5.  Espere o upload.

### 2.1 Configurar as Chaves no Vercel
Para que o site funcione com o Firebase, precisamos colocar aquelas chaves lá.

1.  Vá no painel do seu projeto no site da Vercel.
2.  Clique em **Settings** -> **Environment Variables**.
3.  Adicione as seguintes variáveis (copie os valores daquele código do Firebase que você guardou):

    *   `VITE_FIREBASE_API_KEY`: (Valor de apiKey)
    *   `VITE_FIREBASE_AUTH_DOMAIN`: (Valor de authDomain)
    *   `VITE_FIREBASE_PROJECT_ID`: (Valor de projectId)
    *   `VITE_FIREBASE_STORAGE_BUCKET`: (Valor de storageBucket)
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`: (Valor de messagingSenderId)
    *   `VITE_FIREBASE_APP_ID`: (Valor de appId)

4.  Depois de salvar, você precisa fazer um novo deploy para as chaves funcionarem. No terminal:
    ```bash
    vercel --prod
    ```

**Pronto!** Seu site estará no ar e com login funcionando.
