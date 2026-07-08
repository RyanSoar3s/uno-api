-- CreateEnum
CREATE TYPE "Disponibilidade" AS ENUM ('FISICO_E_DIGITAL', 'APENAS_FISICO', 'APENAS_DIGITAL');

-- CreateEnum
CREATE TYPE "Lado" AS ENUM ('CLARO', 'ESCURO');

-- CreateEnum
CREATE TYPE "TipoCarta" AS ENUM ('NUMERO', 'COMPRAR_DOIS', 'COMPRAR_QUATRO', 'PULAR', 'INVERTER', 'CORINGA', 'CORINGA_COMPRAR_QUATRO', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "Cor" AS ENUM ('VERMELHO', 'AZUL', 'VERDE', 'AMARELO', 'PRETO');

-- CreateTable
CREATE TABLE "baralhos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "anoLancamento" INTEGER,
    "totalCartas" INTEGER NOT NULL,
    "temaLicenciado" TEXT,
    "disponibilidade" "Disponibilidade" NOT NULL,
    "existeFisicamente" BOOLEAN NOT NULL,
    "existeNoJogoDigital" BOOLEAN NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baralhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCarta" NOT NULL,
    "cor" "Cor",
    "numero" INTEGER,
    "lado" "Lado",
    "efeito" TEXT,
    "quantidadeNoBaralho" INTEGER NOT NULL,
    "baralhoId" TEXT NOT NULL,

    CONSTRAINT "cartas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regras_especiais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "baralhoId" TEXT NOT NULL,

    CONSTRAINT "regras_especiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RegraEspecialAfetaCarta" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RegraEspecialAfetaCarta_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "cartas_baralhoId_idx" ON "cartas"("baralhoId");

-- CreateIndex
CREATE INDEX "regras_especiais_baralhoId_idx" ON "regras_especiais"("baralhoId");

-- CreateIndex
CREATE INDEX "_RegraEspecialAfetaCarta_B_index" ON "_RegraEspecialAfetaCarta"("B");

-- AddForeignKey
ALTER TABLE "cartas" ADD CONSTRAINT "cartas_baralhoId_fkey" FOREIGN KEY ("baralhoId") REFERENCES "baralhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_especiais" ADD CONSTRAINT "regras_especiais_baralhoId_fkey" FOREIGN KEY ("baralhoId") REFERENCES "baralhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegraEspecialAfetaCarta" ADD CONSTRAINT "_RegraEspecialAfetaCarta_A_fkey" FOREIGN KEY ("A") REFERENCES "cartas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegraEspecialAfetaCarta" ADD CONSTRAINT "_RegraEspecialAfetaCarta_B_fkey" FOREIGN KEY ("B") REFERENCES "regras_especiais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
