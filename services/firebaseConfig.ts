import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// --- CONFIGURAÇÃO DO FIREBASE ---
// 1. Vá em https://console.firebase.google.com/
// 2. Crie um projeto e registre um app web
// 3. Copie as configurações e cole abaixo substituindo os valores

const firebaseConfig = {
  apiKey: "AIzaSyAk_775fpAyiiyTPmUIVGHHo79W9PoiK-o",
  authDomain: "pizza-solidaria-6b93f.firebaseapp.com",
  projectId: "pizza-solidaria-6b93f",
  storageBucket: "pizza-solidaria-6b93f.firebasestorage.app",
  messagingSenderId: "995607772912",
  appId: "1:995607772912:web:1cb81ec4cc0c8bc794cc35"
};

// Como você já inseriu suas chaves reais, definimos como true para ativar o banco de dados
export const isFirebaseConfigured = true;

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a referência do banco de dados
export const db = getFirestore(app);