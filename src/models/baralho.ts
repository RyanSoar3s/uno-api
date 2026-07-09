export enum Disponibilidade {
  FISICO_E_DIGITAL = "FISICO_E_DIGITAL",
  APENAS_FISICO = "APENAS_FISICO",
  APENAS_DIGITAL = "APENAS_DIGITAL"
}

export enum Lado {
  CLARO = "CLARO",
  ESCURO = "ESCURO"

}

export enum TipoCarta {
  NUMERO = "NUMERO",
  COMPRAR_DOIS = "COMPRAR_DOIS",
  COMPRAR_QUATRO = "COMPRAR_QUATRO",
  PULAR = "PULAR",
  INVERTER = "INVERTER",
  CORINGA = "CORINGA",
  CORINGA_COMPRAR_QUATRO = "CORINGA_COMPRAR_QUATRO",
  ESPECIAL = "ESPECIAL"

}

export enum Cor {
  VERMELHO = "VERMELHO",
  AZUL = "AZUL",
  VERDE = "VERDE",
  AMARELO = "AMARELO",
  PRETO = "PRETO",
  ROSA = "ROSA",
  VERDE_AGUA = "VERDE_AGUA",
  LARANJA = "LARANJA",
  ROXO = "ROXO"
}


// ------------------------------------------------------------------
// Tipos que descrevem o FORMATO DO JSON de seed — não são os mesmos
// tipos gerados pelo Prisma, porque o JSON carrega alguns campos
// extras (quantidadeEstimada, jogavel, ilustracaoTema) que ainda não
// existem como coluna no banco. Deixar isso explícito no tipo, em vez
// de um índice genérico [key: string]: any, é o que evita o uso de `any`
// e ainda documenta exatamente o que estamos escolhendo ignorar.
// ------------------------------------------------------------------

export interface CartaSeed {
  id: string;
  tipo: TipoCarta;
  cor?: Cor | null;
  numero?: number | null;
  lado?: Lado | null;
  efeito?: string | null;
  quantidadeNoBaralho: number;

  // Presentes em alguns seeds, ainda sem coluna correspondente no banco.
  // Ficam tipados (não indefinidos silenciosamente) para deixar claro
  // que são lidos e conscientemente descartados no upsert abaixo.
  quantidadeEstimada?: boolean;
  jogavel?: boolean;
  ilustracaoTema?: string;
}

export interface RegraEspecialSeed {
  nome: string;
  descricao: string;
  afetaCartas: string[];
}

export interface BaralhoSeed {
  id: string;
  nome: string;
  anoLancamento?: number | null;
  totalCartas: number;
  temaLicenciado?: string | null;
  disponibilidade: Disponibilidade;
  existeFisicamente: boolean;
  existeNoJogoDigital: boolean;
  observacao?: string | null;
  regrasEspeciais?: RegraEspecialSeed[];
  cartas: CartaSeed[];
}

export interface UnoSeed {
  baralhos: BaralhoSeed[];
}

