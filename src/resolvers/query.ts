import {
  getBaralhos,
  getBaralho,
  getCartas,
  getCartasByBaralhoId,
  getRegrasEspeciaisByBaralhoId,
  getBaralhoByCartaId,
  getCartasByRegraEspecialId,
  compararBaralhos
} from "../repositories/baralho.repository";

export const resolvers = {
  Query: {
    baralhos: async (_: unknown, args: { tema?: string; disponibilidade?: string }) =>
      await getBaralhos(args.tema, args.disponibilidade),
    baralho: async (_: unknown, args: { id: string }) =>
      await getBaralho(args.id),
    cartas: async (_: unknown, args: { tipo?: string; cor?: string; lado?: string }) =>
      await getCartas(args.tipo, args.cor, args.lado),
    compararBaralhos: async (_: unknown, args: { id1: string; id2: string }) =>
      await compararBaralhos(args.id1, args.id2)

  },
  Baralho: {
    cartas: async (parent: { id: string }) =>
      await getCartasByBaralhoId(parent.id),
    regrasEspeciais: async (parent: { id: string }) =>
      await getRegrasEspeciaisByBaralhoId(parent.id)

  },
  Carta: {
    baralho: async (parent: { baralhoId: string }) =>
      await getBaralhoByCartaId(parent.baralhoId)

  },
  RegraEspecial: {
    afetaCartas: async (parent: { id: string }) =>
      await getCartasByRegraEspecialId(parent.id)

  }

};
