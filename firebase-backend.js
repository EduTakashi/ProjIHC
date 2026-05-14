// ============================================================
//  CarUn — Firebase Backend
//  Arquivo único com toda a camada de dados e autenticação
//
//  COMO USAR:
//  1. Crie um projeto em https://console.firebase.google.com
//  2. Ative Authentication (Email/Password) e Firestore
//  3. Substitua o objeto firebaseConfig abaixo pelos dados do seu projeto
//  4. npm install firebase
//  5. Importe as funções deste arquivo no seu frontend React
// ============================================================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURAÇÃO — substitua pelos valores do seu projeto
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "seu-projeto.firebaseapp.com",
  projectId:         "seu-projeto",
  storageBucket:     "seu-projeto.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// 2. AUTENTICAÇÃO
// ─────────────────────────────────────────────────────────────

/**
 * Cadastra novo usuário e cria documento de perfil no Firestore.
 * @param {string} email
 * @param {string} password
 * @param {{ name, role, university, semester }} profileData
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function registerUser(email, password, profileData) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Cria documento do usuário na coleção "users"
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    name:        profileData.name,
    role:        profileData.role,       // "driver" | "passenger"
    university:  profileData.university,
    semester:    profileData.semester || 1,
    hobbies:     profileData.hobbies || "",
    personality: profileData.personality || "",
    gender:      profileData.gender || "",
    rating:      5.0,
    ratingCount: 0,
    createdAt:   serverTimestamp(),
  });

  return credential;
}

/**
 * Faz login com e-mail e senha.
 */
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Faz logout do usuário atual.
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Observa mudanças no estado de autenticação.
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Altera a senha do usuário autenticado.
 * Requer reautenticação com a senha atual.
 */
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

// ─────────────────────────────────────────────────────────────
// 3. PERFIL DO USUÁRIO
// ─────────────────────────────────────────────────────────────

/**
 * Busca o perfil de um usuário pelo UID.
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Atualiza campos do perfil do usuário.
 * @param {string} uid
 * @param {Object} fields - campos a atualizar
 */
export async function updateUserProfile(uid, fields) {
  await updateDoc(doc(db, "users", uid), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────
// 4. CARONAS (rides)
//
// Estrutura do documento (coleção "rides"):
// {
//   id:          string (auto)
//   driverUid:   string
//   driverName:  string
//   origin:      string
//   destination: string
//   time:        string  ("HH:mm")
//   price:       number
//   seats:       number
//   carModel:    string
//   hobbies:     string
//   personality: string
//   gender:      "M" | "F" | ""
//   active:      boolean
//   createdAt:   Timestamp
// }
// ─────────────────────────────────────────────────────────────

/**
 * Publica uma nova carona.
 * @param {Object} rideData
 * @returns {Promise<string>} id do documento criado
 */
export async function createRide(rideData) {
  const ref = await addDoc(collection(db, "rides"), {
    ...rideData,
    active:    true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Busca todas as caronas ativas, com filtros opcionais.
 * @param {{ gender?: string, maxPrice?: number, origin?: string }} filters
 * @returns {Promise<Object[]>}
 */
export async function getRides(filters = {}) {
  let q = query(
    collection(db, "rides"),
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  let rides = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Filtros adicionais em memória (Firestore limita índices compostos no free tier)
  if (filters.gender)   rides = rides.filter(r => !r.gender || r.gender === filters.gender);
  if (filters.origin)   rides = rides.filter(r => r.origin === filters.origin);
  if (filters.maxPrice) rides = rides.filter(r => r.price <= filters.maxPrice);

  return rides;
}

/**
 * Observa caronas ativas em tempo real.
 * @param {(rides: Object[]) => void} callback
 * @returns {() => void} unsubscribe
 */
export function listenRides(callback) {
  const q = query(
    collection(db, "rides"),
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    const rides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(rides);
  });
}

/**
 * Desativa uma carona (soft delete).
 */
export async function deactivateRide(rideId) {
  await updateDoc(doc(db, "rides", rideId), { active: false });
}

// ─────────────────────────────────────────────────────────────
// 5. SOLICITAÇÕES DE CARONA (requests)
//
// Estrutura do documento (coleção "requests"):
// {
//   id:            string (auto)
//   rideId:        string
//   passengerUid:  string
//   passengerName: string
//   driverUid:     string
//   status:        "pending" | "accepted" | "rejected"
//   createdAt:     Timestamp
// }
// ─────────────────────────────────────────────────────────────

/**
 * Cria uma solicitação de carona.
 */
export async function requestRide(rideId, driverUid, passengerProfile) {
  const ref = await addDoc(collection(db, "requests"), {
    rideId,
    driverUid,
    passengerUid:  passengerProfile.uid,
    passengerName: passengerProfile.name,
    status:        "pending",
    createdAt:     serverTimestamp(),
  });
  return ref.id;
}

/**
 * Observa solicitações recebidas por um motorista.
 */
export function listenDriverRequests(driverUid, callback) {
  const q = query(
    collection(db, "requests"),
    where("driverUid", "==", driverUid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Atualiza o status de uma solicitação.
 * @param {string} requestId
 * @param {"accepted"|"rejected"} status
 */
export async function updateRequestStatus(requestId, status) {
  await updateDoc(doc(db, "requests", requestId), { status });
}

// ─────────────────────────────────────────────────────────────
// 6. CHAT
//
// Estrutura: coleção "chats/{chatId}/messages/{msgId}"
// chatId = uid menor + "_" + uid maior (determinístico)
//
// Documento de mensagem:
// {
//   text:      string
//   senderUid: string
//   createdAt: Timestamp
// }
// ─────────────────────────────────────────────────────────────

/**
 * Retorna o ID de chat determinístico entre dois usuários.
 */
export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

/**
 * Envia uma mensagem no chat.
 */
export async function sendMessage(chatId, senderUid, text) {
  await addDoc(collection(db, "chats", chatId, "messages"), {
    text,
    senderUid,
    createdAt: serverTimestamp(),
  });
  // Atualiza metadados do chat (para listar conversas)
  await setDoc(doc(db, "chats", chatId), {
    participants: chatId.split("_"),
    lastMessage:  text,
    updatedAt:    serverTimestamp(),
  }, { merge: true });
}

/**
 * Observa mensagens de um chat em tempo real.
 * @param {string} chatId
 * @param {(messages: Object[]) => void} callback
 * @returns {() => void} unsubscribe
 */
export function listenMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Lista todas as conversas de um usuário.
 */
export function listenUserChats(uid, callback) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─────────────────────────────────────────────────────────────
// 7. AVALIAÇÕES
//
// Estrutura (coleção "ratings"):
// {
//   ratedUid:   string
//   raterUid:   string
//   rideId:     string
//   score:      number (1–5)
//   comment:    string
//   createdAt:  Timestamp
// }
// ─────────────────────────────────────────────────────────────

/**
 * Registra uma avaliação e recalcula a média no perfil do avaliado.
 */
export async function submitRating(ratedUid, raterUid, rideId, score, comment = "") {
  // Salva a avaliação
  await addDoc(collection(db, "ratings"), {
    ratedUid, raterUid, rideId, score, comment,
    createdAt: serverTimestamp(),
  });

  // Recalcula média no perfil
  const profileRef = doc(db, "users", ratedUid);
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    const { rating, ratingCount } = profileSnap.data();
    const newCount = (ratingCount || 0) + 1;
    const newRating = ((rating || 5) * (newCount - 1) + score) / newCount;
    await updateDoc(profileRef, {
      rating:      parseFloat(newRating.toFixed(2)),
      ratingCount: newCount,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 8. REGRAS DE SEGURANÇA DO FIRESTORE
//    Cole este conteúdo em: Firebase Console → Firestore → Regras
// ─────────────────────────────────────────────────────────────
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuários: leitura pública (perfil), escrita somente pelo próprio usuário
    match /users/{uid} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    // Caronas: qualquer autenticado pode ler; apenas motorista (dono) pode escrever
    match /rides/{rideId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.driverUid == request.auth.uid;
      allow update, delete: if request.auth != null
                            && resource.data.driverUid == request.auth.uid;
    }

    // Solicitações: passageiro cria; motorista atualiza status
    match /requests/{reqId} {
      allow read:   if request.auth != null
                    && (resource.data.passengerUid == request.auth.uid
                        || resource.data.driverUid  == request.auth.uid);
      allow create: if request.auth != null
                    && request.resource.data.passengerUid == request.auth.uid;
      allow update: if request.auth != null
                    && resource.data.driverUid == request.auth.uid;
    }

    // Chat: apenas participantes lêem e escrevem
    match /chats/{chatId} {
      allow read, write: if request.auth != null
                         && request.auth.uid in resource.data.participants;
      match /messages/{msgId} {
        allow read:   if request.auth != null;
        allow create: if request.auth != null
                      && request.resource.data.senderUid == request.auth.uid;
      }
    }

    // Avaliações: leitura pública; escrita autenticada (um por corrida por avaliador)
    match /ratings/{ratingId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.raterUid == request.auth.uid;
    }
  }
}
*/

// ─────────────────────────────────────────────────────────────
// 9. ESTRUTURA DO BANCO (Firestore — visão geral)
// ─────────────────────────────────────────────────────────────
/*
Firestore
├── users/
│   └── {uid}
│       ├── uid, email, name, role ("driver"|"passenger")
│       ├── university, semester, hobbies, personality, gender
│       ├── rating (float), ratingCount (int)
│       └── createdAt, updatedAt
│
├── rides/
│   └── {rideId}
│       ├── driverUid, driverName
│       ├── origin, destination, time, price, seats
│       ├── carModel, hobbies, personality, gender
│       ├── active (boolean)
│       └── createdAt
│
├── requests/
│   └── {requestId}
│       ├── rideId, driverUid
│       ├── passengerUid, passengerName
│       ├── status ("pending"|"accepted"|"rejected")
│       └── createdAt
│
├── chats/
│   └── {uid1_uid2}          ← IDs ordenados e unidos por "_"
│       ├── participants []
│       ├── lastMessage, updatedAt
│       └── messages/
│           └── {msgId}
│               ├── text, senderUid
│               └── createdAt
│
└── ratings/
    └── {ratingId}
        ├── ratedUid, raterUid, rideId
        ├── score (1–5), comment
        └── createdAt
*/
