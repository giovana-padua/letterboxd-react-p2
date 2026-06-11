<h1 align="center"> Filmes & Músicas</h1>
<p align="center">
  <img src="docs/imagens/banner.png" alt="Filmes & Músicas">
</p>


<p align="center">
  Plataforma inspirada no Letterboxd para avaliação de filmes, séries, documentários, músicas e álbuns.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/TMDb-API-01D277" />
  <img src="https://img.shields.io/badge/Deezer-API-FEAA2D" />
</p>

---

# Sobre o Projeto

O **Filmes & Músicas** é uma plataforma de avaliação e descoberta de conteúdo multimídia inspirada no Letterboxd.

Além de filmes, séries e documentários, o sistema permite avaliar músicas e álbuns, criar resenhas e relacionar músicas com obras audiovisuais.

O objetivo é unir duas formas de entretenimento frequentemente conectadas: **cinema** e **música**.

---

# Funcionalidades

## Cinema e TV

- Avaliação de filmes
- Avaliação de séries
- Avaliação de documentários
- Visualização de elenco
- Trailer integrado
- Onde assistir
- Rankings de popularidade
- Premiações (Oscar e Globo de Ouro)

## Música

- Avaliação de músicas
- Avaliação de álbuns
- Preview de músicas
- Integração com Deezer
- Rankings musicais
- Indicações ao Grammy

## Comunidade

- Sistema de resenhas
- Avaliações de 0 a 10
- Favoritos
- Perfis de usuário
- Estatísticas pessoais

## Diferencial do Projeto

O principal diferencial do sistema é permitir que usuários:

- Relacionem músicas com filmes e séries
- Indiquem músicas em suas resenhas
- Expliquem a relação entre a música e a obra
- Descubram conteúdos através das recomendações da comunidade

---

# Tecnologias Utilizadas

## Frontend

- React
- React Router DOM
- Bootstrap 5
- Swiper.js

## Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- BcryptJS
- Nodemailer

## APIs

### TMDb

Utilizada para:

- Filmes
- Séries
- Documentários
- Elenco
- Trailers
- Rankings
- Premiações

### Deezer

Utilizada para:

- Músicas
- Álbuns
- Artistas
- Preview de músicas
- Rankings musicais

---

# 📂 Estrutura do Projeto

```text
FilmesEMusicas/
│
├── backend/
│   ├── config/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── docs/
│   └── imagens/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── package.json
└── README.md
```

---

# ⚙️ Instalação

## 1. Clonar o repositório

```bash
git https://github.com/giovana-padua/letterboxd-react-p2.git
```

```bash
cd letterboxd-react-p2
```

---

## 2. Instalar dependências do Frontend

```bash
npm install
```

---

## 3. Instalar dependências do Backend

```bash
cd backend
npm install
```

---

# Configuração do Ambiente

## Frontend

Crie:

```env
.env
```

---

## Backend

Crie:

```env
backend/.env
```

Exemplo:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/filme_musica?retryWrites=true&w=majority

# JWT
JWT_SECRET=gere_uma_chave_aleatoria

# API - TMDb
TMDB_API_KEY=sua_chave_tmdb

# Google SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_google
EMAIL_FROM=seu_email@gmail.com

```

---

# Executando o Projeto

## Backend

```bash
cd backend
npm run dev
```

---

## Frontend

```bash
npm start
```

Aplicação disponível em:

```text
http://localhost:3000
```

---

# Capturas de Tela

## Página Inicial

A página inicial reúne conteúdos populares, rankings, destaques e busca unificada.

![Home](docs/imagens/home.png)

---

## Busca Unificada

Pesquise filmes, séries, documentários, músicas, artistas e álbuns.

![Busca](docs/imagens/busca.png)

---

## Página da Mídia

Informações detalhadas da obra, trailer, elenco, avaliações e favoritos.

![Detalhes Filme](docs/imagens/detalhes-filme.png)

---

## Página da Música

Preview, informações do álbum, artista e conteúdos relacionados.

![Detalhes Música](docs/imagens/detalhes-musica.png)

---

## Autenticação

### Login

![Login](docs/imagens/login.png)

### Cadastro

![Cadastro](docs/imagens/cadastro.png)

### Recuperação de Senha

![Recuperação](docs/imagens/recuperar-senha.png)

---

## Sistema de Resenhas

Usuários podem criar avaliações e relacionar músicas às obras.

### Filmes e músicas relacionadas

![Resenha Filme - 1](docs/imagens/resenhas-filme.png)

![Resenha Filme - 2](docs/imagens/resenhas-filme2.png)

---

## Favoritos

Salve filmes, séries, músicas e álbuns.

![Favoritos](docs/imagens/favoritos.png)

---

## Minhas Avaliações

Histórico de avaliações do usuário.

![Avaliações](docs/imagens/minhas-avaliacoes.png)

---

## Perfil

Perfil do usuário com estatísticas e gerenciamento da conta.

![Perfil](docs/imagens/perfil-usuario.png)

---

## Estatísticas

Resumo da atividade do usuário na plataforma.

![Estatísticas](docs/imagens/estatisticas-usuario.png)

---

## Moderação

Painel de gerenciamento para moderadores.

![Moderador](docs/imagens/perfil-moderador.png)

---

## Rankings de Cinema

Filmes e séries em destaque.

![Rankings](docs/imagens/rankings.png)

---

## Rankings Musicais

Músicas e álbuns mais populares.

![Rankings Musicais](docs/imagens/rankings-musicais.png)

---

## Premiações

### Oscar e Globo de Ouro

![Premiações](docs/imagens/premiacoes.png)

### Grammy

![Grammy](docs/imagens/grammy-albuns.png)

---

# Equipe

Projeto desenvolvido para fins acadêmicos.

Integrantes:

- Ana Carolina Manea Bueno
- Giovana Gonçalves Pádua
- Gustavo Roberto Silva Pereira
- João Pedro Martins de Souza

---

# Roadmap Futuro

- [ ] Sistema de seguidores
- [ ] Listas personalizadas
- [ ] Comentários em resenhas
- [ ] Recomendações por IA
- [ ] Sistema de conquistas
- [ ] Compartilhamento de listas
- [ ] Estatísticas avançadas
- [ ] Personalização e edição do perfil

---

# Licença

Projeto acadêmico desenvolvido para fins educacionais.