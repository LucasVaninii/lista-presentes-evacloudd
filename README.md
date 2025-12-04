# 🎁 Lista de Presentes EvaCloudd

Site para organizar e visualizar sugestões de presentes da EvaCloudd.

## 📋 Funcionalidades

- ✅ Adicionar sugestões de presentes com nome, presente e link
- ✅ Visualizar todas as sugestões de todos os usuários
- ✅ Interface moderna e responsiva
- ✅ Funciona no GitHub Pages (localStorage) ou com backend (SQLite)
- ✅ Banco de dados SQLite para armazenamento local (modo backend)

## 🚀 Deploy Rápido no GitHub Pages

### Opção 1: Apenas Frontend (Mais Simples)

O site já funciona totalmente no navegador usando localStorage!

1. **Crie um repositório no GitHub**

2. **Suba os arquivos:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/SEU_USUARIO/lista-presentes-evacloudd.git
   git branch -M main
   git push -u origin main
   ```

3. **Ative o GitHub Pages:**

   - Vá em Settings → Pages
   - Source: branch `main`, pasta `/ (root)`
   - Salve e aguarde alguns minutos

4. **Acesse:** `https://SEU_USUARIO.github.io/lista-presentes-evacloudd/`

📖 **Guia completo:** Veja o arquivo [DEPLOY.md](DEPLOY.md) para instruções detalhadas!

---

## 🚀 Como Instalar e Executar Localmente

### Pré-requisitos

- Node.js instalado (versão 14 ou superior)
- NPM (geralmente vem com Node.js)

### Passo a Passo

1. **Instalar as dependências:**

   ```bash
   npm install
   ```

2. **Iniciar o servidor:**

   ```bash
   npm start
   ```

   Para desenvolvimento com auto-reload:

   ```bash
   npm run dev
   ```

3. **Abrir no navegador:**
   - Acesse: `http://localhost:3000`
   - O banco de dados SQLite será criado automaticamente na primeira execução

## 📁 Estrutura do Projeto

```
.
├── index.html          # Página principal
├── style.css           # Estilos da aplicação
├── script.js           # JavaScript do frontend (funciona com ou sem backend)
├── server.js           # Servidor Node.js/Express (opcional)
├── package.json        # Dependências do projeto
├── .nojekyll           # Arquivo necessário para GitHub Pages
├── DEPLOY.md           # Guia completo de deploy
├── gifts.db            # Banco de dados SQLite (criado automaticamente, se usar backend)
└── README.md           # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **Frontend:**

  - HTML5
  - CSS3 (com design moderno e responsivo)
  - JavaScript (Vanilla)

- **Backend:**
  - Node.js
  - Express.js
  - SQLite3

## 📝 Como Usar

1. Acesse o site no navegador
2. Preencha o formulário:
   - Seu Nome
   - Nome do Presente
   - Link do Presente
3. Clique em "Adicionar Presente"
4. Todas as sugestões aparecerão na lista abaixo, visíveis para todos os usuários

## 💡 Dicas

### Modo GitHub Pages (localStorage)

- Cada navegador salva seus próprios presentes
- Dados persistem mesmo fechando o navegador
- Não compartilha entre usuários diferentes

### Modo Backend (SQLite)

- O banco de dados SQLite é criado automaticamente na primeira execução
- Todos os dados ficam salvos no arquivo `gifts.db`
- Todos os usuários veem os mesmos presentes
- A lista é atualizada automaticamente após adicionar um novo presente

### Para Compartilhar entre Usuários no GitHub Pages:

- Use a Opção 2 do guia DEPLOY.md (backend na nuvem)
- Configure a URL da API no `script.js`

## 📦 Dependências

- `express`: Framework web para Node.js
- `sqlite3`: Banco de dados SQLite
- `cors`: Middleware para permitir requisições cross-origin
- `nodemon`: Para desenvolvimento (auto-reload)

## 🔧 Personalização

Você pode personalizar:

- Cores no arquivo `style.css` (variáveis CSS no início)
- Porta do servidor em `server.js` (variável PORT)
- Layout e design em `index.html` e `style.css`

---

Desenvolvido com 💝 para EvaCloudd
