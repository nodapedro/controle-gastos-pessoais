# Controle de Gastos

Sistema web para controle de gastos pessoais: o usuário registra receitas e despesas, organiza por categorias e acompanha o saldo e o total gasto por categoria em um período.

Projeto da disciplina **Projeto de Desenvolvimento de Software II** (UniFil).

## Autoria

- **[SEU NOME COMPLETO]**: projeto individual.

## Funcionalidades

1. **Autenticar usuário:** cadastro e login com senha protegida por hash.
2. **Gerenciar categorias:** criar, listar, editar e excluir.
3. **Registrar lançamentos:** receitas e despesas com descrição, valor, data e categoria.
4. **Consultar e filtrar lançamentos:** listagem com filtro por período e categoria, edição e exclusão.
5. **Visualizar relatório:** total de receitas, total de despesas, saldo e total por categoria.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Linguagem | TypeScript (ESM) |
| Servidor | Node.js + Express 5 |
| Banco de dados | PostgreSQL |
| ORM e migrations | TypeORM |
| Interface | EJS (templates HTML renderizados no servidor) |
| Segurança | bcrypt (hash de senha) e express-session (sessão) |
| Validação | zod (variáveis de ambiente e dados de entrada) |
| Execução em desenvolvimento | tsx |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.11 ou superior
- [PostgreSQL](https://www.postgresql.org/) em execução na máquina
- npm (instalado junto com o Node.js)

## Como executar

**1. Clonar o repositório e instalar as dependências**

```bash
git clone https://github.com/SEU_USUARIO/controle-gastos.git
cd controle-gastos
npm install
```

**2. Criar o banco de dados**

Pelo DBeaver ou pelo `psql`:

```sql
CREATE DATABASE controle_gastos;
```

**3. Configurar as variáveis de ambiente**

Copie o arquivo de exemplo e preencha com os dados do seu PostgreSQL:

```bash
# Linux e macOS
cp .env.example .env

# Windows (Prompt de Comando)
copy .env.example .env
```

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test` ou `production` | `development` |
| `PORT` | Porta do servidor | `3000` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USER` | Usuário do banco | obrigatória |
| `DB_PASSWORD` | Senha do banco | obrigatória |
| `DB_NAME` | Nome do banco | obrigatória |

**4. Iniciar a aplicação**

```bash
npm run dev
```

As migrations são aplicadas automaticamente na inicialização, então as tabelas são criadas sem nenhum passo extra. Acesse <http://localhost:3000>.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento, reiniciando a cada alteração |
| `npm run build` | Compila o TypeScript para a pasta `dist/` |
| `npm start` | Executa a versão compilada (`npm run build` antes) |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |
| `npm run migration:generate -- src/database/migrations/Nome` | Gera uma migration a partir das diferenças entre as entidades e o banco |
| `npm run migration:run` | Aplica as migrations pendentes |
| `npm run migration:revert` | Desfaz a última migration aplicada |

## Estrutura do projeto

```
src/
├── config/          # leitura e validação das variáveis de ambiente
├── database/
│   ├── data-source.ts
│   └── migrations/  # histórico versionado do esquema do banco
├── entities/        # entidades do TypeORM (tabelas)
├── routes/          # rotas HTTP
├── services/        # regras de negócio
└── server.ts        # ponto de entrada
views/               # templates EJS
```

## Decisões de projeto

- **Migrations em vez de `synchronize`:** cada alteração no esquema do banco fica registrada em um arquivo versionado, que pode ser revisado e revertido.
- **Configuração validada na inicialização:** a aplicação não sobe se alguma variável obrigatória estiver ausente.
- **Camadas separadas (rotas, serviços e entidades):** facilita a manutenção e os testes.
- **Valores monetários em `numeric(12,2)`:** evita erros de arredondamento de ponto flutuante.

## Documentação e vídeo de defesa

- Documentação (PDF): [LINK OU CAMINHO]
- Vídeo de defesa: [LINK DO YOUTUBE]
