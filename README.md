# Uno API

API GraphQL para consulta de baralhos de Uno, suas cartas e regras especiais. Construída com Apollo Server, Prisma ORM, PostgreSQL e TypeScript.

## Stack

| Tecnologia        | Versão | Finalidade                        |
|-------------------|--------|-----------------------------------|
| **Node**          | ≥22    | Runtime                           |
| **TypeScript**    | 5.9    | Linguagem                         |
| **Apollo Server** | 5.5    | Servidor GraphQL                  |
| **Prisma**        | 7.8    | ORM / migrations / client         |
| **PostgreSQL**    | 16     | Banco de dados relacional         |
| **Docker**        | —      | Postgres local via `compose.yml`  |
| **Vitest**        | 4.1    | Testes unitários                  |

## Pré-requisitos

- Node.js ≥ 22
- Docker & Docker Compose
- npm

## Setup

```bash
# 1. Clonar o repositório
git clone git@github.com:RyanSoar3s/uno-api.git
cd uno-api

# 2. Instalar dependências
npm install

# 3. Subir o PostgreSQL
npm run db:up

# 4. Copiar / configurar variáveis de ambiente
cp .env.example .env
# Edite DATABASE_URL se necessário (default: postgresql://postgres:postgres@localhost:5432/uno)

# 5. Rodar migrations do Prisma
npx prisma migrate dev

# 6. (Opcional) Popular o banco com dados de seed
npm run db:fill

# 7. Iniciar o servidor
npm start
```

O servidor estará disponível em `http://localhost:4000/graphql`.

## Scripts disponíveis

| Comando                 | Descrição                                    |
|-------------------------|----------------------------------------------|
| `npm start`             | Inicia o servidor GraphQL                    |
| `npm run build`         | Compila o projeto com Vite                   |
| `npm test`              | Executa os testes unitários (vitest run)     |
| `npm run test:watch`    | Executa testes em modo watch                 |
| `npm run test:coverage` | Executa testes com cobertura                 |
| `npm run db:up`         | Sobe o PostgreSQL via Docker Compose         |
| `npm run db:down`       | Derruba o container PostgreSQL               |
| `npm run db:fill`       | Popula o banco com dados de seed             |
| `npm run lint`          | Executa ESLint em todo o `src/`              |

## Schema GraphQL

### Enums

```graphql
enum Disponibilidade {
  FISICO_E_DIGITAL
  APENAS_FISICO
  APENAS_DIGITAL
}

enum Lado {
  CLARO
  ESCURO
}

enum TipoCarta {
  NUMERO
  COMPRAR_DOIS
  COMPRAR_QUATRO
  PULAR
  INVERTER
  CORINGA
  CORINGA_COMPRAR_QUATRO
  ESPECIAL
}

enum Cor {
  VERMELHO
  AZUL
  VERDE
  AMARELO
  PRETO
  ROSA
  VERDE_AGUA
  LARANJA
  ROXO
}
```

### Queries

```graphql
# Listar baralhos (com filtros opcionais)
baralhos(tema: String, disponibilidade: Disponibilidade): [Baralho!]!

# Buscar um baralho pelo ID
baralho(id: ID!): Baralho

# Listar cartas (com filtros opcionais)
cartas(tipo: TipoCarta, cor: Cor, lado: Lado): [Carta!]!

# Comparar dois baralhos
compararBaralhos(id1: ID!, id2: ID!): ComparacaoBaralhos!
```

### Types

```graphql
type Baralho {
  id: ID!
  nome: String!
  anoLancamento: Int
  totalCartas: Int!
  temaLicenciado: String
  disponibilidade: Disponibilidade!
  existeFisicamente: Boolean!
  existeNoJogoDigital: Boolean!
  observacao: String
  regrasEspeciais: [RegraEspecial!]!
  cartas: [Carta!]!
}

type Carta {
  id: ID!
  tipo: TipoCarta!
  cor: Cor
  numero: Int
  lado: Lado
  efeito: String
  quantidadeNoBaralho: Int!
  baralho: Baralho!
}

type RegraEspecial {
  nome: String!
  descricao: String!
  afetaCartas: [Carta!]!
}

type ComparacaoBaralhos {
  cartasExclusivasBaralho1: [Carta!]!
  cartasExclusivasBaralho2: [Carta!]!
  regrasDiferentes: [String!]!
}
```

## Exemplos de consultas

### Listar todos os baralhos

```graphql
query {
  baralhos {
    id
    nome
    totalCartas
    disponibilidade
  }
}
```

### Buscar baralho com cartas e regras

```graphql
query {
  baralho(id: "classico") {
    nome
    anoLancamento
    cartas {
      tipo
      cor
      numero
      quantidadeNoBaralho
    }
    regrasEspeciais {
      nome
      descricao
    }
  }
}
```

### Filtrar cartas por tipo e cor

```graphql
query {
  cartas(tipo: NUMERO, cor: VERMELHO) {
    tipo
    cor
    numero
    quantidadeNoBaralho
    baralho {
      nome
    }
  }
}
```

### Comparar dois baralhos

```graphql
query {
  compararBaralhos(id1: "classico", id2: "flip") {
    cartasExclusivasBaralho1 { tipo cor numero }
    cartasExclusivasBaralho2 { tipo cor numero }
    regrasDiferentes
  }
}
```

## Estrutura do projeto

```
src/
├── __tests__/
│   ├── repositories/
│   │   └── baralho.repository.test.ts   # Testes do repositório (24 testes)
│   └── resolvers/
│       └── query.test.ts                # Testes dos resolvers (12 testes)
├── db/
│   ├── client.ts                        # Singleton do Prisma Client
│   ├── seed.ts                          # Script de seed do banco
│   └── seeds/seed.json                  # Dados de seed
├── models/
│   └── baralho.ts                       # Enums e interfaces dos tipos
├── repositories/
│   └── baralho.repository.ts            # Acesso a dados (Prisma queries)
├── resolvers/
│   └── query.ts                         # Resolvers GraphQL
├── schema/
│   ├── index.ts                         # Leitura do schema GraphQL
│   └── typesDef.graphql                 # Definição do schema GraphQL
└── server.ts                            # Entry point do Apollo Server
```

## Banco de dados

O schema do banco é gerenciado pelo Prisma. O arquivo de schema está em `prisma/schema.prisma` com os modelos `Baralho`, `Carta` e `RegraEspecial`.

```bash
# Criar uma nova migration
npx prisma migrate dev --name descricao_da_migration

# Abrir o Prisma Studio (UI para visualizar dados)
npx prisma studio
```

## Testes

Os testes usam **Vitest** com mocks do Prisma Client (repositório) e do próprio repositório (resolvers).

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
