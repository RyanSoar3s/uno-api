import { getClient } from "../db/client";

const prisma = getClient();

async function getCartas(tipoCarta?: string, cor?: string, lado?: string) {
  const cartas = await prisma.carta.findMany();

  const cartasFiltradas = cartas.filter((c) => {
    if (!(tipoCarta && cor && lado)) return true;

    return (
      c.tipo === tipoCarta ||
      c.cor === cor ||
      c.lado === lado

    );

  });

  return cartasFiltradas;

}

async function getBaralhos(tema?: string, disponibilidade?: string) {
  const baralhos = await prisma.baralho.findMany();

  const baralhosFiltrados = baralhos.filter((b) => {
    if (!(tema && disponibilidade)) return true;

    return (
      b.temaLicenciado === tema ||
      b.disponibilidade === disponibilidade

    );

  });

  return baralhosFiltrados;

}

async function getBaralho(id: string) {
  const baralhos = await getBaralhos();

  const baralhoFiltrado = baralhos.filter((b) => b.id === id);

  return baralhoFiltrado;

}

async function getRegrasEspeciais(id: string) {
  const regras = await prisma.regraEspecial.findMany();

  const regrasFiltradas = regras.filter((r) => r.baralhoId === id);

  return regrasFiltradas;

}

async function compararBaralhos(id1: string, id2: string) {
  const cartas = await getCartas();

  const cartasExclusivasBaralho1 = cartas.filter((c) => c.baralhoId === id1);
  const regrasEspeciaisBaralho1 = await getRegrasEspeciais(id1);
  const regrasEspeciaisBaralho1Desc = regrasEspeciaisBaralho1.map((r) => r.descricao);

  const cartasExclusivasBaralho2 = cartas.filter((c) => c.baralhoId === id2);
  const regrasEspeciaisBaralho2 = await getRegrasEspeciais(id2);
  const regrasEspeciaisBaralho2Desc = regrasEspeciaisBaralho2.map((r) => r.descricao);

  const regrasDiferentes = Array.from(new Set([ ...regrasEspeciaisBaralho1Desc, ...regrasEspeciaisBaralho2Desc ]));

  return {
    cartasExclusivasBaralho1,
    cartasExclusivasBaralho2,
    regrasDiferentes

  }

}

export {
  getBaralhos,
  getBaralho,
  getCartas,
  compararBaralhos

}
