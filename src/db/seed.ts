import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";
import type { UnoSeed } from "../models/baralho";

import seed from "./seeds/seed.json" with { type: "json" };


const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Environment variable DATABASE_URL is not set");

}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl })

});

async function populateDB(): Promise<void> {
  await prisma.baralho.deleteMany();
  await prisma.carta.deleteMany();
  await prisma.regraEspecial.deleteMany();

  console.log(`Banco de dados limpo`)

  const baralhos = (seed as unknown as UnoSeed).baralhos;

   for (const b of baralhos) {
    console.log(`→ Semeando "${b.nome}" (${b.id})...`);

    // upsert do Baralho — só os campos que existem no schema.prisma atual.
    // Campos extras do JSON (ex: quantidadeEstimada, jogavel, ilustracaoTema,
    // designerExterno) são ignorados de propósito: ainda não existem como
    // colunas no banco, então não fazem parte do "shape" esperado pelo Prisma.
    await prisma.baralho.upsert({
      where: { id: b.id! },
      update: {},
      create: {
        id: b.id!,
        nome: b.nome!,
        anoLancamento: b.anoLancamento ?? null,
        totalCartas: b.totalCartas!,
        temaLicenciado: b.temaLicenciado ?? null,
        disponibilidade: b.disponibilidade!,
        existeFisicamente: b.existeFisicamente!,
        existeNoJogoDigital: b.existeNoJogoDigital!,
        observacao: b.observacao ?? null

      }

    });

    // Cartas — dependem do Baralho já existir (FK baralhoId)
    for (const c of b.cartas) {
      await prisma.carta.upsert({
        where: { id: c.id! },
        update: {},
        create: {
          id: c.id!,
          tipo: c.tipo!,
          cor: c.cor ?? null,
          numero: c.numero ?? null,
          lado: c.lado ?? null,
          efeito: c.efeito ?? null,
          quantidadeNoBaralho: c.quantidadeNoBaralho!,
          baralhoId: b.id!
        }

      });

    }

    // Regras especiais — dependem das Cartas já existirem, pois
    // "afetaCartas" conecta pelos ids de carta já inseridos acima.
    for (const r of b.regrasEspeciais ?? []) {
      await prisma.regraEspecial.create({
        data: {
          nome: r.nome!,
          descricao: r.descricao!,
          baralhoId: b.id!,
          afetaCartas: {
            connect: (r.afetaCartas).map((cartaId: string) => ({ id: cartaId })),

          }

        }

      });

    }

  }

  console.log('✅ Seed concluído.');

}

populateDB()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);

  })
  .finally(async () => {
    await prisma.$disconnect();

  });

