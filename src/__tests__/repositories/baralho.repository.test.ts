import { describe, it, expect, vi, beforeEach } from "vitest";

// ------------------------------------------------------------------
// Mock do Prisma Client — vi.hoisted é a ÚNICA maneira de criar
// variáveis que estejam disponíveis TANTO no factory do vi.mock
// (que é hoisted) QUANTO no corpo do teste.
// ------------------------------------------------------------------
const { mockFindMany, mockFindUnique, mockModuleFactory } = vi.hoisted(() => {
  const mockFindMany = vi.fn();
  const mockFindUnique = vi.fn();
  return {
    mockFindMany,
    mockFindUnique,
    // O factory do vi.mock precisa ser uma função que retorna o módulo mockado.
    // Criamos uma closure que captura essas mesmas referências.
    mockModuleFactory: () => ({
      getClient: () => ({
        carta: { findMany: mockFindMany, findUnique: mockFindUnique },
        baralho: { findMany: mockFindMany, findUnique: mockFindUnique },
        regraEspecial: { findMany: mockFindMany, findUnique: mockFindUnique }
      })
    })
  };
});

vi.mock("../../db/client", () => mockModuleFactory());

// ------------------------------------------------------------------
// Import AFTER mocks (vitest hoists vi.mock)
// ------------------------------------------------------------------
import {
  getBaralhos,
  getBaralho,
  getCartas,
  getCartasByBaralhoId,
  getRegrasEspeciaisByBaralhoId,
  getBaralhoByCartaId,
  getCartasByRegraEspecialId,
  compararBaralhos
} from "../../repositories/baralho.repository";

// ------------------------------------------------------------------
// Fixtures
// ------------------------------------------------------------------
const baralhoFixture = {
  id: "classic",
  nome: "Uno Classic",
  totalCartas: 108,
  disponibilidade: "FISICO_E_DIGITAL",
  existeFisicamente: true,
  existeNoJogoDigital: true
};

const cartaFixture = {
  id: "carta-1",
  tipo: "NUMERO",
  cor: "VERMELHO",
  numero: 5,
  quantidadeNoBaralho: 2
};

const regraFixture = {
  id: "regra-1",
  nome: "Flip Side",
  descricao: "Cartas viram para o lado escuro",
  baralhoId: "flip"
};

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------
describe("baralho.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- getBaralhos ----
  describe("getBaralhos", () => {
    it("deve retornar todos os baralhos quando nenhum filtro é passado", async () => {
      mockFindMany.mockResolvedValueOnce([baralhoFixture]);

      const result = await getBaralhos();

      expect(mockFindMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([baralhoFixture]);
    });

    it("deve filtrar por tema quando o argumento tema é passado", async () => {
      mockFindMany.mockResolvedValueOnce([baralhoFixture]);

      const result = await getBaralhos("Marvel");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { temaLicenciado: "Marvel" } });
      expect(result).toEqual([baralhoFixture]);
    });

    it("deve filtrar por disponibilidade quando o argumento disponibilidade é passado", async () => {
      mockFindMany.mockResolvedValueOnce([baralhoFixture]);

      const result = await getBaralhos(undefined, "APENAS_DIGITAL");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { disponibilidade: "APENAS_DIGITAL" } });
      expect(result).toEqual([baralhoFixture]);
    });

    it("deve filtrar por tema e disponibilidade simultaneamente", async () => {
      mockFindMany.mockResolvedValueOnce([baralhoFixture]);

      const result = await getBaralhos("Marvel", "FISICO_E_DIGITAL");

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { temaLicenciado: "Marvel", disponibilidade: "FISICO_E_DIGITAL" }
      });
      expect(result).toEqual([baralhoFixture]);
    });

    it("deve retornar array vazio quando nenhum baralho corresponde", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      const result = await getBaralhos("TemaInexistente");

      expect(result).toEqual([]);
    });
  });

  // ---- getBaralho ----
  describe("getBaralho", () => {
    it("deve retornar um baralho pelo id", async () => {
      mockFindUnique.mockResolvedValueOnce(baralhoFixture);

      const result = await getBaralho("classic");

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "classic" } });
      expect(result).toEqual(baralhoFixture);
    });

    it("deve retornar null quando o baralho não existe", async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const result = await getBaralho("id-inexistente");

      expect(result).toBeNull();
    });
  });

  // ---- getCartas ----
  describe("getCartas", () => {
    it("deve retornar todas as cartas quando nenhum filtro é passado", async () => {
      mockFindMany.mockResolvedValueOnce([cartaFixture]);

      const result = await getCartas();

      expect(mockFindMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([cartaFixture]);
    });

    it("deve filtrar por tipo", async () => {
      mockFindMany.mockResolvedValueOnce([cartaFixture]);

      const result = await getCartas("NUMERO");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { tipo: "NUMERO" } });
      expect(result).toEqual([cartaFixture]);
    });

    it("deve filtrar por cor", async () => {
      mockFindMany.mockResolvedValueOnce([cartaFixture]);

      const result = await getCartas(undefined, "VERMELHO");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { cor: "VERMELHO" } });
      expect(result).toEqual([cartaFixture]);
    });

    it("deve filtrar por lado", async () => {
      mockFindMany.mockResolvedValueOnce([{ ...cartaFixture, lado: "CLARO" }]);

      const result = await getCartas(undefined, undefined, "CLARO");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { lado: "CLARO" } });
      expect(result).toHaveLength(1);
    });

    it("deve combinar múltiplos filtros", async () => {
      mockFindMany.mockResolvedValueOnce([cartaFixture]);

      const result = await getCartas("NUMERO", "VERMELHO");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { tipo: "NUMERO", cor: "VERMELHO" } });
      expect(result).toEqual([cartaFixture]);
    });
  });

  // ---- getCartasByBaralhoId ----
  describe("getCartasByBaralhoId", () => {
    it("deve retornar cartas de um baralho específico", async () => {
      mockFindMany.mockResolvedValueOnce([cartaFixture]);

      const result = await getCartasByBaralhoId("classic");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { baralhoId: "classic" } });
      expect(result).toEqual([cartaFixture]);
    });

    it("deve retornar array vazio quando o baralho não tem cartas", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      const result = await getCartasByBaralhoId("baralho-vazio");

      expect(result).toEqual([]);
    });
  });

  // ---- getRegrasEspeciaisByBaralhoId ----
  describe("getRegrasEspeciaisByBaralhoId", () => {
    it("deve retornar regras especiais de um baralho", async () => {
      mockFindMany.mockResolvedValueOnce([regraFixture]);

      const result = await getRegrasEspeciaisByBaralhoId("flip");

      expect(mockFindMany).toHaveBeenCalledWith({ where: { baralhoId: "flip" } });
      expect(result).toEqual([regraFixture]);
    });

    it("deve retornar array vazio quando não há regras especiais", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      const result = await getRegrasEspeciaisByBaralhoId("sem-regras");

      expect(result).toEqual([]);
    });
  });

  // ---- getBaralhoByCartaId ----
  describe("getBaralhoByCartaId", () => {
    it("deve retornar o baralho associado a uma carta (pelo baralhoId)", async () => {
      mockFindUnique.mockResolvedValueOnce(baralhoFixture);

      const result = await getBaralhoByCartaId("classic");

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "classic" } });
      expect(result).toEqual(baralhoFixture);
    });

    it("deve retornar null quando o baralho não existe", async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const result = await getBaralhoByCartaId("id-inexistente");

      expect(result).toBeNull();
    });
  });

  // ---- getCartasByRegraEspecialId ----
  describe("getCartasByRegraEspecialId", () => {
    it("deve retornar as cartas afetadas por uma regra especial", async () => {
      mockFindUnique.mockResolvedValueOnce({
        ...regraFixture,
        afetaCartas: [cartaFixture]
      });

      const result = await getCartasByRegraEspecialId("regra-1");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: "regra-1" },
        include: { afetaCartas: true }
      });
      expect(result).toEqual([cartaFixture]);
    });

    it("deve retornar array vazio quando a regra não existe", async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const result = await getCartasByRegraEspecialId("regra-inexistente");

      expect(result).toEqual([]);
    });

    it("deve retornar array vazio quando a regra não afeta nenhuma carta", async () => {
      mockFindUnique.mockResolvedValueOnce({
        ...regraFixture,
        afetaCartas: []
      });

      const result = await getCartasByRegraEspecialId("regra-1");

      expect(result).toEqual([]);
    });
  });

  // ---- compararBaralhos ----
  describe("compararBaralhos", () => {
    it("deve comparar dois baralhos e retornar cartas e regras diferentes", async () => {
      const cartasBaralho1 = [{ ...cartaFixture, id: "c1", tipo: "NUMERO" }];
      const cartasBaralho2 = [{ ...cartaFixture, id: "c2", tipo: "PULAR" }];
      const regras1 = [{ nome: "Regra A", descricao: "Desc A" }];
      const regras2 = [{ nome: "Regra B", descricao: "Desc B" }];

      // As chamadas internas são: getCartasByBaralhoId(id1), getCartasByBaralhoId(id2),
      // getRegrasEspeciaisByBaralhoId(id1), getRegrasEspeciaisByBaralhoId(id2)
      mockFindMany
        .mockResolvedValueOnce(cartasBaralho1) // getCartasByBaralhoId(id1)
        .mockResolvedValueOnce(cartasBaralho2) // getCartasByBaralhoId(id2)
        .mockResolvedValueOnce(regras1)        // getRegrasEspeciaisByBaralhoId(id1)
        .mockResolvedValueOnce(regras2);       // getRegrasEspeciaisByBaralhoId(id2)

      const result = await compararBaralhos("baralho-1", "baralho-2");

      expect(result).toEqual({
        cartasExclusivasBaralho1: cartasBaralho1,
        cartasExclusivasBaralho2: cartasBaralho2,
        regrasDiferentes: ["Desc A", "Desc B"]
      });
    });

    it("deve retornar regrasDiferentes sem duplicatas quando os baralhos compartilham regras", async () => {
      const cartasBaralho1 = [cartaFixture];
      const cartasBaralho2 = [{ ...cartaFixture, id: "c2" }];
      const regras1 = [{ nome: "Comum", descricao: "Regra comum" }];
      const regras2 = [{ nome: "Comum", descricao: "Regra comum" }];

      mockFindMany
        .mockResolvedValueOnce(cartasBaralho1)
        .mockResolvedValueOnce(cartasBaralho2)
        .mockResolvedValueOnce(regras1)
        .mockResolvedValueOnce(regras2);

      const result = await compararBaralhos("b1", "b2");

      // Usa Set para deduplicar, então "Regra comum" aparece apenas uma vez
      expect(result.regrasDiferentes).toEqual(["Regra comum"]);
    });

    it("deve retornar regrasDiferentes vazio quando ambos os baralhos não têm regras", async () => {
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await compararBaralhos("b1", "b2");

      expect(result.regrasDiferentes).toEqual([]);
    });
  });
});
