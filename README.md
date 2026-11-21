# Controle de Gastos Pessoais

Sistema web para gerenciamento de finanças pessoais. Permite cadastrar receitas e despesas, organizá-las por categorias, consultar lançamentos por período e acompanhar o saldo e os gastos por categoria.

Projeto desenvolvido para a disciplina **Projeto de Desenvolvimento de Software II**, da UniFil.

## Autoria

- **Pedro Lucas Tavares Noda** — Projeto individual.

## Funcionalidades

1. **Autenticação de usuários:** cadastro, login e logout, com senhas armazenadas por meio de hash.
2. **Gerenciamento de categorias:** criação, listagem, edição e exclusão de categorias. A exclusão é impedida quando existem lançamentos associados.
3. **Gerenciamento de lançamentos:** cadastro, listagem, edição e exclusão de receitas e despesas, com descrição, valor, data e categoria.
4. **Consulta e filtros:** listagem de lançamentos com filtros por período e categoria.
5. **Relatórios financeiros:** visualização do total de receitas, total de despesas, saldo e despesas agrupadas por categoria.
6. **Isolamento de dados:** cada usuário acessa e gerencia somente suas próprias categorias e seus próprios lançamentos.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Linguagem | TypeScript (ESM) |
| Ambiente de execução | Node.js |
| Servidor web | Express 5 |
| Banco de dados | PostgreSQL |
| ORM e migrations | TypeORM |
| Interface | EJS, HTML e CSS |
| Autenticação | bcrypt e express-session |
| Validação | Zod para variáveis de ambiente e validações no servidor |
| Desenvolvimento | tsx |
| Formatação | Intl.DateTimeFormat e Intl.NumberFormat |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.11 ou superior.
- [PostgreSQL](https://www.postgresql.org/) instalado e em execução.
- npm (instalado junto com o Node.js).
- Git.

## Como executar

### 1. Clonar o repositório e instalar as dependências

```bash
git clone https://github.com/nodapedro/controle-gastos-pessoais.git
cd controle-gastos-pessoais
npm install
```

### 2. Criar o banco de dados

Crie um banco PostgreSQL chamado `controle_gastos`, utilizando o DBeaver ou o `psql`:

```sql
CREATE DATABASE controle_gastos;
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, utilizando `.env.example` como referência.

No Windows (Prompt de Comando):

```cmd
copy .env.example .env
```

No Linux e macOS:

```bash
cp .env.example .env
```

Configure as seguintes variáveis:

| Variável | Descrição | Valor padrão |
| --- | --- | --- |
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta do servidor | `3000` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USER` | Usuário do banco de dados | Obrigatória |
| `DB_PASSWORD` | Senha do banco de dados | Obrigatória |
| `DB_NAME` | Nome do banco de dados | Obrigatória |
| `SESSION_SECRET` | Segredo utilizado para assinar as sessões | Obrigatória |

O `SESSION_SECRET` deve ser uma string aleatória e suficientemente longa. Não compartilhe nem versione o arquivo `.env`.

### 4. Executar a aplicação

```bash
npm run dev
```

Na inicialização, a aplicação estabelece a conexão com o PostgreSQL e executa automaticamente as migrations pendentes.

Acesse:

[http://localhost:3000](http://localhost:3000)

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento com reinicialização automática utilizando tsx. |
| `npm run build` | Compila o TypeScript para a pasta `dist/`. |
| `npm start` | Executa a aplicação compilada. |
| `npm run typecheck` | Verifica os tipos TypeScript sem gerar arquivos. |
| `npm run migration:generate -- src/database/migrations/Nome` | Gera uma migration com base nas diferenças entre as entidades e o banco. |
| `npm run migration:run` | Executa as migrations pendentes. |
| `npm run migration:revert` | Desfaz a última migration executada. |

**Observação:** as migrations são executadas automaticamente durante a inicialização da aplicação devido à configuração `migrationsRun: true`. Os comandos manuais continuam disponíveis para gerenciamento do esquema do banco.

## Estrutura do projeto

```text
src/
├── app.ts
├── server.ts
├── config/
│   └── env.ts
├── database/
│   ├── data-source.ts
│   └── migrations/
├── middlewares/
│   ├── auth.middleware.ts
│   └── validate-uuid-param.middleware.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   └── auth.service.ts
│   ├── users/
│   │   └── user.entity.ts
│   ├── categories/
│   │   ├── category.entity.ts
│   │   ├── category.controller.ts
│   │   ├── category.routes.ts
│   │   └── category.service.ts
│   ├── financial-entries/
│   │   ├── financial-entry.entity.ts
│   │   ├── financial-entry.controller.ts
│   │   ├── financial-entry.routes.ts
│   │   └── financial-entry.service.ts
│   └── reports/
│       ├── report.controller.ts
│       ├── report.routes.ts
│       └── report.service.ts
├── utils/
│   ├── format-date.ts
│   └── format-currency.ts
├── types/
│   └── express-session.d.ts
└── views/

views/
├── auth/
│   ├── login.ejs
│   └── register.ejs
├── categories/
│   ├── index.ejs
│   └── form.ejs
├── financial-entries/
│   ├── index.ejs
│   └── form.ejs
├── reports/
│   └── index.ejs
└── home.ejs
```

- `app.ts`: configura o Express, middlewares, sessões, templates e rotas.
- `server.ts`: inicializa a conexão com o banco de dados e inicia o servidor HTTP.
- `config/`: configurações e validação das variáveis de ambiente.
- `database/`: configuração do TypeORM e migrations.
- `middlewares/`: autenticação e validação de parâmetros das rotas.
- `modules/`: funcionalidades da aplicação, organizadas por domínio.
- `utils/`: funções auxiliares de formatação.
- `views/`: templates EJS renderizados pelo servidor.
- `public/`: arquivos estáticos, como CSS e JavaScript.

Dentro dos módulos, as responsabilidades são separadas entre entidades, serviços, controllers e rotas.

## Decisões de projeto

- **Migrations em vez de `synchronize`:** as alterações no esquema do banco são controladas por migrations versionadas, evitando modificações automáticas na estrutura do banco.
- **Separação de responsabilidades:** rotas, controllers, services e entidades possuem responsabilidades distintas, facilitando a organização e manutenção do código.
- **Autenticação por sessão:** o sistema utiliza `express-session` para manter o usuário autenticado entre requisições.
- **Hash de senha:** as senhas são protegidas utilizando bcrypt e nunca armazenadas em texto puro.
- **Isolamento de dados:** as consultas e operações de categorias e lançamentos consideram o identificador do usuário autenticado.
- **UUID como chave primária:** as entidades utilizam identificadores UUID para registros.
- **Precisão monetária:** valores financeiros são armazenados no PostgreSQL utilizando `NUMERIC(12,2)`, evitando problemas de precisão de ponto flutuante.
- **Integridade referencial:** relacionamentos entre usuários, categorias e lançamentos são protegidos por chaves estrangeiras e constraints no banco.
- **Validação de dados:** os dados recebidos são validados no servidor antes de serem persistidos.
- **Consultas de relatório:** os totais financeiros e os agrupamentos por categoria são calculados diretamente no PostgreSQL.
- **Formatação de valores e datas:** os valores monetários e as datas são apresentados de acordo com os padrões brasileiros.
