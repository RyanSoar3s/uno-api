import { getBaralhos, getBaralho, getCartas, compararBaralhos } from "../repositories/baralho.repository";

export const resolvers = {
  Query: {
    baralhos: async (tema?: string, disponibilidade?: string) => await getBaralhos(tema, disponibilidade),
    baralho: async (id: string) => await getBaralho(id),
    cartas: async (tipoCarta?: string, cor?: string, lado?: string) => await getCartas(tipoCarta, cor, lado),
    compararBaralhos: async (id1: string, id2: string) => compararBaralhos(id1, id2)

  }

};
