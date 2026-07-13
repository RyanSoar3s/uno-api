import { getClient } from "../db/client";

const prisma = getClient();

async function getCartas(tipoCarta?: string, cor?: string, lado?: string) {
  const where: Record<string, string> = {};

  if (tipoCarta) where.tipo = tipoCarta;
  if (cor) where.cor = cor;
  if (lado) where.lado = lado;

  return await prisma.carta.findMany({ where });

}

async function getBaralhos(tema?: string, disponibilidade?: string) {
  const where: Record<string, string> = {};

  if (tema) where.temaLicenciado = tema;
  if (disponibilidade) where.disponibilidade = disponibilidade;

  return await prisma.baralho.findMany({ where });

}

async function getBaralho(id: string) {
  return await prisma.baralho.findUnique({ where: { id } });

}

async function getCartasByBaralhoId(baralhoId: string) {
  return await prisma.carta.findMany({ where: { baralhoId } });

}

async function getRegrasEspeciaisByBaralhoId(baralhoId: string) {
  return await prisma.regraEspecial.findMany({ where: { baralhoId } });

}

async function getBaralhoByCartaId(baralhoId: string) {
  return await prisma.baralho.findUnique({ where: { id: baralhoId } });

}

async function getCartasByRegraEspecialId(regraEspecialId: string) {
  const regra = await prisma.regraEspecial.findUnique({
    where: { id: regraEspecialId },
    include: { afetaCartas: true }

  });

  return regra?.afetaCartas ?? [];

}

async function compararBaralhos(id1: string, id2: string) {
  const [cartasBaralho1, cartasBaralho2, regrasBaralho1, regrasBaralho2] = await Promise.all([
    getCartasByBaralhoId(id1),
    getCartasByBaralhoId(id2),
    getRegrasEspeciaisByBaralhoId(id1),
    getRegrasEspeciaisByBaralhoId(id2)

  ]);

  const regrasDiferentes = Array.from(
    new Set([
      ...regrasBaralho1.map((r) => r.descricao),
      ...regrasBaralho2.map((r) => r.descricao)

    ])

  );

  return {
    cartasExclusivasBaralho1: cartasBaralho1,
    cartasExclusivasBaralho2: cartasBaralho2,
    regrasDiferentes

  };

}

export {
  getBaralhos,
  getBaralho,
  getCartas,
  getCartasByBaralhoId,
  getRegrasEspeciaisByBaralhoId,
  getBaralhoByCartaId,
  getCartasByRegraEspecialId,
  compararBaralhos
  
}
