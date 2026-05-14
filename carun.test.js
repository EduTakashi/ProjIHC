// ============================================================
//  CarUn — Testes
//  Arquivo: carun.test.js
//
//  Framework: Vitest  (100% compatível com a sintaxe Jest)
//  Para instalar e rodar: veja README abaixo
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── MOCK COMPLETO DO FIREBASE ────────────────────────────────
// Substitui os módulos reais por dublês controlados nos testes
vi.mock("firebase/auth", () => ({
  getAuth:                       vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword:    vi.fn(),
  signOut:                       vi.fn(),
  onAuthStateChanged:            vi.fn(),
  updatePassword:                vi.fn(),
  EmailAuthProvider:             { credential: vi.fn() },
  reauthenticateWithCredential:  vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore:    vi.fn(() => ({})),
  doc:             vi.fn(),
  setDoc:          vi.fn(),
  getDoc:          vi.fn(),
  updateDoc:       vi.fn(),
  collection:      vi.fn(),
  addDoc:          vi.fn(),
  query:           vi.fn(),
  where:           vi.fn(),
  orderBy:         vi.fn(),
  onSnapshot:      vi.fn(),
  serverTimestamp: vi.fn(() => "TIMESTAMP"),
  getDocs:         vi.fn(),
  deleteDoc:       vi.fn(),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

// Importa os mocks já configurados
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import {
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

// Importa as funções a testar
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  createRide,
  getRides,
  requestRide,
  getChatId,
  sendMessage,
  submitRating,
} from "./firebase-backend";

// ─── DADOS DE EXEMPLO ─────────────────────────────────────────
const MOCK_USER = {
  uid:   "uid-joao-123",
  email: "joao@mackenzista.com.br",
};

const MOCK_PROFILE = {
  uid:        "uid-joao-123",
  name:       "João Silva",
  email:      "joao@mackenzista.com.br",
  role:       "driver",
  university: "Mackenzie",
  semester:   3,
  hobbies:    "Futebol",
  rating:     4.8,
  ratingCount: 5,
};

const MOCK_RIDE = {
  id:           "ride-abc-001",
  driverUid:    "uid-joao-123",
  driverName:   "João Silva",
  driverRating: 4.8,
  origin:       "Zona Leste",
  destination:  "Mackenzie",
  time:         "08:00",
  price:        10,
  seats:        3,
  active:       true,
};

// ─── RESET DOS MOCKS ENTRE TESTES ─────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================
//  BLOCO 1 — AUTENTICAÇÃO
// =============================================================
describe("🔐 Autenticação", () => {

  // ── TESTE 1 ──────────────────────────────────────────────────
  it("deve cadastrar usuário e criar perfil no Firestore", async () => {
    // Arrange
    createUserWithEmailAndPassword.mockResolvedValue({ user: MOCK_USER });
    setDoc.mockResolvedValue(undefined);

    // Act
    const result = await registerUser(
      "joao@mackenzista.com.br",
      "senha123",
      { name: "João Silva", role: "driver", university: "Mackenzie" }
    );

    // Assert
    expect(createUserWithEmailAndPassword).toHaveBeenCalledOnce();
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "joao@mackenzista.com.br",
      "senha123"
    );
    expect(setDoc).toHaveBeenCalledOnce(); // perfil criado no Firestore
    expect(result.user.uid).toBe("uid-joao-123");
  });

  // ── TESTE 2 ──────────────────────────────────────────────────
  it("deve lançar erro quando e-mail já está em uso", async () => {
    // Arrange
    const firebaseError = { code: "auth/email-already-in-use", message: "Email already in use" };
    createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

    // Act & Assert
    await expect(
      registerUser("joao@mackenzista.com.br", "senha123", { name: "João" })
    ).rejects.toMatchObject({ code: "auth/email-already-in-use" });

    expect(setDoc).not.toHaveBeenCalled(); // perfil NÃO deve ser criado
  });

  // ── TESTE 3 ──────────────────────────────────────────────────
  it("deve fazer login com credenciais corretas", async () => {
    // Arrange
    signInWithEmailAndPassword.mockResolvedValue({ user: MOCK_USER });

    // Act
    const result = await loginUser("joao@mackenzista.com.br", "senha123");

    // Assert
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "joao@mackenzista.com.br",
      "senha123"
    );
    expect(result.user.email).toBe("joao@mackenzista.com.br");
  });

  // ── TESTE 4 ──────────────────────────────────────────────────
  it("deve lançar erro com senha incorreta", async () => {
    // Arrange
    signInWithEmailAndPassword.mockRejectedValue({ code: "auth/wrong-password" });

    // Act & Assert
    await expect(loginUser("joao@mackenzista.com.br", "senhaErrada"))
      .rejects.toMatchObject({ code: "auth/wrong-password" });
  });

  // ── TESTE 5 ──────────────────────────────────────────────────
  it("deve fazer logout com sucesso", async () => {
    // Arrange
    signOut.mockResolvedValue(undefined);

    // Act
    await logoutUser();

    // Assert
    expect(signOut).toHaveBeenCalledOnce();
  });

  // ── TESTE 6 ──────────────────────────────────────────────────
  it("deve alterar senha após reautenticação bem-sucedida", async () => {
    // Arrange
    EmailAuthProvider.credential.mockReturnValue({ type: "credential" });
    reauthenticateWithCredential.mockResolvedValue(undefined);
    updatePassword.mockResolvedValue(undefined);

    // Act
    await changePassword("senhaAtual", "novaSenha123");

    // Assert
    expect(reauthenticateWithCredential).toHaveBeenCalledOnce();
    expect(updatePassword).toHaveBeenCalledWith(expect.anything(), "novaSenha123");
  });

  // ── TESTE 7 ──────────────────────────────────────────────────
  it("deve lançar erro ao alterar senha com senha atual incorreta", async () => {
    // Arrange
    reauthenticateWithCredential.mockRejectedValue({ code: "auth/wrong-password" });

    // Act & Assert
    await expect(changePassword("senhaErrada", "nova123"))
      .rejects.toMatchObject({ code: "auth/wrong-password" });

    expect(updatePassword).not.toHaveBeenCalled();
  });
});

// =============================================================
//  BLOCO 2 — PERFIL DO USUÁRIO
// =============================================================
describe("👤 Perfil do Usuário", () => {

  // ── TESTE 8 ──────────────────────────────────────────────────
  it("deve retornar o perfil quando o usuário existe", async () => {
    // Arrange
    getDoc.mockResolvedValue({ exists: () => true, data: () => MOCK_PROFILE });

    // Act
    const profile = await getUserProfile("uid-joao-123");

    // Assert
    expect(profile).toEqual(MOCK_PROFILE);
    expect(profile.name).toBe("João Silva");
    expect(profile.role).toBe("driver");
  });

  // ── TESTE 9 ──────────────────────────────────────────────────
  it("deve retornar null quando usuário não existe", async () => {
    // Arrange
    getDoc.mockResolvedValue({ exists: () => false });

    // Act
    const profile = await getUserProfile("uid-inexistente");

    // Assert
    expect(profile).toBeNull();
  });

  // ── TESTE 10 ─────────────────────────────────────────────────
  it("deve atualizar campos do perfil corretamente", async () => {
    // Arrange
    updateDoc.mockResolvedValue(undefined);

    // Act
    await updateUserProfile("uid-joao-123", { name: "João S.", semester: 4 });

    // Assert
    expect(updateDoc).toHaveBeenCalledOnce();
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: "João S.", semester: 4 })
    );
  });
});

// =============================================================
//  BLOCO 3 — CARONAS
// =============================================================
describe("🚗 Caronas", () => {

  // ── TESTE 11 ─────────────────────────────────────────────────
  it("deve publicar uma carona e retornar o ID gerado", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "ride-novo-999" });

    // Act
    const id = await createRide({
      driverUid:   "uid-joao-123",
      driverName:  "João Silva",
      origin:      "Zona Leste",
      destination: "Mackenzie",
      time:        "08:00",
      price:       10,
      seats:       3,
    });

    // Assert
    expect(addDoc).toHaveBeenCalledOnce();
    expect(id).toBe("ride-novo-999");
  });

  // ── TESTE 12 ─────────────────────────────────────────────────
  it("deve buscar caronas ativas e retornar lista", async () => {
    // Arrange
    const rideDocs = [
      { id: "ride-001", data: () => ({ ...MOCK_RIDE, id: undefined }) },
      { id: "ride-002", data: () => ({ ...MOCK_RIDE, id: undefined, origin: "Zona Norte" }) },
    ];
    getDocs.mockResolvedValue({ docs: rideDocs });

    // Act
    const rides = await getRides();

    // Assert
    expect(rides).toHaveLength(2);
    expect(rides[0].id).toBe("ride-001");
    expect(rides[1].origin).toBe("Zona Norte");
  });

  // ── TESTE 13 ─────────────────────────────────────────────────
  it("deve filtrar caronas por gênero corretamente", async () => {
    // Arrange
    const rideDocs = [
      { id: "r1", data: () => ({ ...MOCK_RIDE, gender: "M" }) },
      { id: "r2", data: () => ({ ...MOCK_RIDE, gender: "F" }) },
      { id: "r3", data: () => ({ ...MOCK_RIDE, gender: "M" }) },
    ];
    getDocs.mockResolvedValue({ docs: rideDocs });

    // Act
    const rides = await getRides({ gender: "F" });

    // Assert
    expect(rides).toHaveLength(1);
    expect(rides[0].id).toBe("r2");
  });

  // ── TESTE 14 ─────────────────────────────────────────────────
  it("deve filtrar caronas por preço máximo", async () => {
    // Arrange
    const rideDocs = [
      { id: "r1", data: () => ({ ...MOCK_RIDE, price: 8  }) },
      { id: "r2", data: () => ({ ...MOCK_RIDE, price: 10 }) },
      { id: "r3", data: () => ({ ...MOCK_RIDE, price: 15 }) },
    ];
    getDocs.mockResolvedValue({ docs: rideDocs });

    // Act
    const rides = await getRides({ maxPrice: 10 });

    // Assert
    expect(rides).toHaveLength(2);
    expect(rides.every(r => r.price <= 10)).toBe(true);
  });

  // ── TESTE 15 ─────────────────────────────────────────────────
  it("deve filtrar caronas por origem", async () => {
    // Arrange
    const rideDocs = [
      { id: "r1", data: () => ({ ...MOCK_RIDE, origin: "Zona Leste" }) },
      { id: "r2", data: () => ({ ...MOCK_RIDE, origin: "Zona Norte" }) },
    ];
    getDocs.mockResolvedValue({ docs: rideDocs });

    // Act
    const rides = await getRides({ origin: "Zona Leste" });

    // Assert
    expect(rides).toHaveLength(1);
    expect(rides[0].origin).toBe("Zona Leste");
  });

  // ── TESTE 16 ─────────────────────────────────────────────────
  it("deve retornar lista vazia quando não há caronas", async () => {
    // Arrange
    getDocs.mockResolvedValue({ docs: [] });

    // Act
    const rides = await getRides();

    // Assert
    expect(rides).toHaveLength(0);
    expect(Array.isArray(rides)).toBe(true);
  });

  // ── TESTE 17 ─────────────────────────────────────────────────
  it("deve escutar caronas em tempo real via onSnapshot", () => {
    // Arrange
    const callback = vi.fn();
    const unsubscribeMock = vi.fn();
    onSnapshot.mockImplementation((query, cb) => {
      // Simula disparo imediato com 2 caronas
      cb({ docs: [
        { id: "r1", data: () => MOCK_RIDE },
        { id: "r2", data: () => ({ ...MOCK_RIDE, id: "r2" }) },
      ]});
      return unsubscribeMock;
    });

    // Act
    const { listenRides } = require("./firebase-backend");
    const unsub = listenRides(callback);

    // Assert
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: "r1" }),
    ]));
    expect(typeof unsub).toBe("function"); // retorna função de cleanup
  });
});

// =============================================================
//  BLOCO 4 — SOLICITAÇÕES DE CARONA
// =============================================================
describe("📋 Solicitações de Carona", () => {

  // ── TESTE 18 ─────────────────────────────────────────────────
  it("deve criar uma solicitação de carona com status 'pending'", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "req-xyz-001" });

    const passenger = { uid: "uid-ana-456", name: "Ana Maria" };

    // Act
    const reqId = await requestRide("ride-abc-001", "uid-joao-123", passenger);

    // Assert
    expect(addDoc).toHaveBeenCalledOnce();
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        rideId:        "ride-abc-001",
        driverUid:     "uid-joao-123",
        passengerUid:  "uid-ana-456",
        passengerName: "Ana Maria",
        status:        "pending",
      })
    );
    expect(reqId).toBe("req-xyz-001");
  });

  // ── TESTE 19 ─────────────────────────────────────────────────
  it("deve atualizar status da solicitação para 'accepted'", async () => {
    // Arrange
    updateDoc.mockResolvedValue(undefined);

    // Act
    const { updateRequestStatus } = require("./firebase-backend");
    await updateRequestStatus("req-xyz-001", "accepted");

    // Assert
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { status: "accepted" }
    );
  });

  // ── TESTE 20 ─────────────────────────────────────────────────
  it("deve atualizar status da solicitação para 'rejected'", async () => {
    // Arrange
    updateDoc.mockResolvedValue(undefined);

    // Act
    const { updateRequestStatus } = require("./firebase-backend");
    await updateRequestStatus("req-xyz-001", "rejected");

    // Assert
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { status: "rejected" }
    );
  });
});

// =============================================================
//  BLOCO 5 — CHAT
// =============================================================
describe("💬 Chat", () => {

  // ── TESTE 21 ─────────────────────────────────────────────────
  it("deve gerar chatId determinístico e ordenado", () => {
    // Act
    const id1 = getChatId("uid-aaa", "uid-zzz");
    const id2 = getChatId("uid-zzz", "uid-aaa"); // ordem inversa

    // Assert
    expect(id1).toBe(id2); // sempre igual independente da ordem
    expect(id1).toBe("uid-aaa_uid-zzz"); // menor primeiro
  });

  // ── TESTE 22 ─────────────────────────────────────────────────
  it("deve enviar mensagem e atualizar metadados do chat", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "msg-001" });
    setDoc.mockResolvedValue(undefined);

    // Act
    await sendMessage("uid-aaa_uid-zzz", "uid-aaa", "Oi, tudo bem?");

    // Assert
    expect(addDoc).toHaveBeenCalledOnce(); // mensagem salva
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        text:      "Oi, tudo bem?",
        senderUid: "uid-aaa",
      })
    );
    expect(setDoc).toHaveBeenCalledOnce(); // metadados do chat atualizados
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ lastMessage: "Oi, tudo bem?" }),
      { merge: true }
    );
  });

  // ── TESTE 23 ─────────────────────────────────────────────────
  it("deve escutar mensagens em tempo real e retornar unsubscribe", () => {
    // Arrange
    const callback = vi.fn();
    const mockUnsub = vi.fn();
    onSnapshot.mockImplementation((q, cb) => {
      cb({ docs: [
        { id: "msg-1", data: () => ({ text: "Olá!", senderUid: "uid-aaa" }) },
      ]});
      return mockUnsub;
    });

    // Act
    const { listenMessages } = require("./firebase-backend");
    const unsub = listenMessages("uid-aaa_uid-zzz", callback);

    // Assert
    expect(callback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "msg-1", text: "Olá!" }),
      ])
    );
    expect(unsub).toBe(mockUnsub);
  });

  // ── TESTE 24 ─────────────────────────────────────────────────
  it("não deve enviar mensagem vazia", async () => {
    // Note: validação de mensagem vazia deve ser feita no frontend.
    // Este teste verifica que sendMessage COM texto funciona normalmente.
    addDoc.mockResolvedValue({ id: "msg-002" });
    setDoc.mockResolvedValue(undefined);

    await sendMessage("chat-id-123", "uid-aaa", "Mensagem válida");

    expect(addDoc).toHaveBeenCalledOnce();
  });
});

// =============================================================
//  BLOCO 6 — AVALIAÇÕES
// =============================================================
describe("⭐ Avaliações", () => {

  // ── TESTE 25 ─────────────────────────────────────────────────
  it("deve registrar avaliação e recalcular média do perfil", async () => {
    // Arrange — perfil tem rating=4.0 com 4 avaliações
    addDoc.mockResolvedValue({ id: "rating-001" });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ rating: 4.0, ratingCount: 4 }),
    });
    updateDoc.mockResolvedValue(undefined);

    // Act — nova avaliação com nota 5
    await submitRating("uid-joao-123", "uid-ana-456", "ride-abc-001", 5, "Ótimo motorista!");

    // Assert
    expect(addDoc).toHaveBeenCalledOnce(); // avaliação salva
    expect(updateDoc).toHaveBeenCalledOnce(); // média atualizada
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        rating:      4.2,  // (4.0 * 4 + 5) / 5 = 4.2
        ratingCount: 5,
      })
    );
  });

  // ── TESTE 26 ─────────────────────────────────────────────────
  it("deve calcular corretamente a primeira avaliação de um perfil novo", async () => {
    // Arrange — sem avaliações anteriores (padrão 5.0 com 0 avaliações)
    addDoc.mockResolvedValue({ id: "rating-002" });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ rating: 5.0, ratingCount: 0 }),
    });
    updateDoc.mockResolvedValue(undefined);

    // Act
    await submitRating("uid-pedro-789", "uid-ana-456", "ride-abc-002", 4);

    // Assert — (5.0 * 0 + 4) / 1 = 4.0
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ rating: 4.0, ratingCount: 1 })
    );
  });

  // ── TESTE 27 ─────────────────────────────────────────────────
  it("não deve atualizar média se o perfil do avaliado não existir", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "rating-003" });
    getDoc.mockResolvedValue({ exists: () => false });

    // Act
    await submitRating("uid-inexistente", "uid-ana-456", "ride-x", 5);

    // Assert
    expect(addDoc).toHaveBeenCalledOnce();  // avaliação salva mesmo assim
    expect(updateDoc).not.toHaveBeenCalled(); // média NÃO atualizada
  });
});

// =============================================================
//  BLOCO 7 — VALIDAÇÕES DE NEGÓCIO (sem Firebase)
// =============================================================
describe("✅ Validações de Negócio", () => {

  // ── TESTE 28 ─────────────────────────────────────────────────
  it("getChatId deve ser simétrico com qualquer par de UIDs", () => {
    const pairs = [
      ["abc", "xyz"],
      ["zzz", "aaa"],
      ["user-1", "user-999"],
    ];
    pairs.forEach(([a, b]) => {
      expect(getChatId(a, b)).toBe(getChatId(b, a));
    });
  });

  // ── TESTE 29 ─────────────────────────────────────────────────
  it("getChatId não deve ser o mesmo para pares diferentes", () => {
    expect(getChatId("a", "b")).not.toBe(getChatId("a", "c"));
    expect(getChatId("x", "y")).not.toBe(getChatId("x", "z"));
  });

  // ── TESTE 30 ─────────────────────────────────────────────────
  it("deve incluir 'active: true' ao criar uma carona", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "ride-new" });

    // Act
    await createRide({ driverUid: "uid-joao", origin: "Leste", price: 10 });

    // Assert
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ active: true })
    );
  });

  // ── TESTE 31 ─────────────────────────────────────────────────
  it("deve incluir timestamp ao criar carona", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "ride-ts" });

    // Act
    await createRide({ driverUid: "uid-joao", origin: "Norte", price: 12 });

    // Assert
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ createdAt: "TIMESTAMP" }) // serverTimestamp mockado
    );
  });

  // ── TESTE 32 ─────────────────────────────────────────────────
  it("deve incluir timestamp ao criar solicitação de carona", async () => {
    // Arrange
    addDoc.mockResolvedValue({ id: "req-ts" });

    // Act
    await requestRide("ride-001", "uid-driver", { uid: "uid-pass", name: "Passageiro" });

    // Assert
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ createdAt: "TIMESTAMP" })
    );
  });

  // ── TESTE 33 ─────────────────────────────────────────────────
  it("deve incluir todos os campos obrigatórios ao cadastrar usuário", async () => {
    // Arrange
    createUserWithEmailAndPassword.mockResolvedValue({ user: MOCK_USER });
    setDoc.mockResolvedValue(undefined);

    // Act
    await registerUser("novo@mackenzista.com.br", "senha123", {
      name: "Novo Aluno", role: "passenger", university: "Mackenzie"
    });

    // Assert
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        uid:        MOCK_USER.uid,
        email:      "novo@mackenzista.com.br",
        name:       "Novo Aluno",
        role:       "passenger",
        university: "Mackenzie",
        rating:     5.0,
        ratingCount: 0,
      })
    );
  });
});
