/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ------------------------------------------------------------------
// Mock do repositório — todas as funções retornam Promises
// ------------------------------------------------------------------
vi.mock("../../repositories/baralho.repository", () => ({
  getBaralhos: vi.fn(),
  getBaralho: vi.fn(),
  getCartas: vi.fn(),
  getCartasByBaralhoId: vi.fn(),
  getRegrasEspeciaisByBaralhoId: vi.fn(),
  getBaralhoByCartaId: vi.fn(),
  getCartasByRegraEspecialId: vi.fn(),
  compararBaralhos: vi.fn()
}));

// ------------------------------------------------------------------
// Import AFTER mocks
// ------------------------------------------------------------------
import { resolvers } from "../../resolvers/query";
import * as repo from "../../repositories/baralho.repository";

// ------------------------------------------------------------------
// Fixtures — usamos `any` porque são mocks e o tipo Prisma é mais
// restrito do que os campos que os testes acessam.
// ------------------------------------------------------------------
const baralhoFixture: any = {
  id: "classic",
  nome: "Uno Classic",
  totalCartas: 108,
  disponibilidade: "FISICO_E_DIGITAL",
  existeFisicamente: true,
  existeNoJogoDigital: true,
  criadoEm: new Date("2026-01-01"),
  atualizadoEm: new Date("2026-01-01")
};

const cartaFixture: any = {
  id: "carta-1",
  tipo: "NUMERO",
  cor: "VERMELHO",
  numero: 5,
  lado: null,
  efeito: null,
  quantidadeNoBaralho: 2,
  baralhoId: "classic"
};

const regraFixture: any = {
  id: "regra-1",
  nome: "Flip Side",
  descricao: "Cartas viram para o lado escuro",
  baralhoId: "flip"
};

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------
describe("Query resolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query.baralhos", () => {
    it("deve retornar todos os baralhos sem filtros", async () => {
      vi.mocked(repo.getBaralhos).mockResolvedValueOnce([baralhoFixture]);

      const result = await resolvers.Query.baralhos(undefined, {});

      expect(repo.getBaralhos).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual([baralhoFixture]);
    });

    it("deve passar tema e disponibilidade para o repositório", async () => {
      vi.mocked(repo.getBaralhos).mockResolvedValueOnce([baralhoFixture]);

      const result = await resolvers.Query.baralhos(undefined, {
        tema: "Marvel",
        disponibilidade: "FISICO_E_DIGITAL"
      });

      expect(repo.getBaralhos).toHaveBeenCalledWith("Marvel", "FISICO_E_DIGITAL");
      expect(result).toEqual([baralhoFixture]);
    });

    it("deve passar apenas tema quando disponibilidade não é fornecida", async () => {
      vi.mocked(repo.getBaralhos).mockResolvedValueOnce([baralhoFixture]);

      const result = await resolvers.Query.baralhos(undefined, { tema: "Marvel" });

      expect(repo.getBaralhos).toHaveBeenCalledWith("Marvel", undefined);
      expect(result).toEqual([baralhoFixture]);
    });
  });

  describe("Query.baralho", () => {
    it("deve retornar um baralho pelo id", async () => {
      vi.mocked(repo.getBaralho).mockResolvedValueOnce(baralhoFixture);

      const result = await resolvers.Query.baralho(undefined, { id: "classic" });

      expect(repo.getBaralho).toHaveBeenCalledWith("classic");
      expect(result).toEqual(baralhoFixture);
    });

    it("deve retornar null quando o baralho não existe", async () => {
      vi.mocked(repo.getBaralho).mockResolvedValueOnce(null);

      const result = await resolvers.Query.baralho(undefined, { id: "inexistente" });

      expect(result).toBeNull();
    });
  });

  describe("Query.cartas", () => {
    it("deve retornar todas as cartas sem filtros", async () => {
      vi.mocked(repo.getCartas).mockResolvedValueOnce([cartaFixture]);

      const result = await resolvers.Query.cartas(undefined, {});

      expect(repo.getCartas).toHaveBeenCalledWith(undefined, undefined, undefined);
      expect(result).toEqual([cartaFixture]);
    });

    it("deve passar tipo, cor e lado para o repositório", async () => {
      vi.mocked(repo.getCartas).mockResolvedValueOnce([cartaFixture]);

      const result = await resolvers.Query.cartas(undefined, {
        tipo: "NUMERO",
        cor: "VERMELHO",
        lado: "CLARO"
      });

      expect(repo.getCartas).toHaveBeenCalledWith("NUMERO", "VERMELHO", "CLARO");
      expect(result).toEqual([cartaFixture]);
    });
  });

  describe("Query.compararBaralhos", () => {
    it("deve comparar dois baralhos", async () => {
      const comparacaoMock = {
        cartasExclusivasBaralho1: [cartaFixture],
        cartasExclusivasBaralho2: [],
        regrasDiferentes: ["Regra A"]
      };

      vi.mocked(repo.compararBaralhos).mockResolvedValueOnce(comparacaoMock as any);

      const result = await resolvers.Query.compararBaralhos(undefined, {
        id1: "b1",
        id2: "b2"
      });

      expect(repo.compararBaralhos).toHaveBeenCalledWith("b1", "b2");
      expect(result).toEqual(comparacaoMock);
    });
  });

  describe("Baralho.cartas (resolver de tipo)", () => {
    it("deve buscar cartas pelo baralhoId do parent", async () => {
      vi.mocked(repo.getCartasByBaralhoId).mockResolvedValueOnce([cartaFixture]);

      const result = await resolvers.Baralho.cartas({ id: "classic" });

      expect(repo.getCartasByBaralhoId).toHaveBeenCalledWith("classic");
      expect(result).toEqual([cartaFixture]);
    });
  });

  describe("Baralho.regrasEspeciais (resolver de tipo)", () => {
    it("deve buscar regras especiais pelo baralhoId do parent", async () => {
      vi.mocked(repo.getRegrasEspeciaisByBaralhoId).mockResolvedValueOnce([regraFixture]);

      const result = await resolvers.Baralho.regrasEspeciais({ id: "flip" });

      expect(repo.getRegrasEspeciaisByBaralhoId).toHaveBeenCalledWith("flip");
      expect(result).toEqual([regraFixture]);
    });
  });

  describe("Carta.baralho (resolver de tipo)", () => {
    it("deve buscar baralho pelo baralhoId da carta parent", async () => {
      vi.mocked(repo.getBaralhoByCartaId).mockResolvedValueOnce(baralhoFixture);

      const result = await resolvers.Carta.baralho({ baralhoId: "classic" });

      expect(repo.getBaralhoByCartaId).toHaveBeenCalledWith("classic");
      expect(result).toEqual(baralhoFixture);
    });
  });

  describe("RegraEspecial.afetaCartas (resolver de tipo)", () => {
    it("deve buscar cartas afetadas pelo id da regra parent", async () => {
      vi.mocked(repo.getCartasByRegraEspecialId).mockResolvedValueOnce([cartaFixture]);

      const result = await resolvers.RegraEspecial.afetaCartas({ id: "regra-1" });

      expect(repo.getCartasByRegraEspecialId).toHaveBeenCalledWith("regra-1");
      expect(result).toEqual([cartaFixture]);
    });
  });
});
