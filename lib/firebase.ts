"use client"

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Validação de variáveis de ambiente
const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Verificar se todas as variáveis estão definidas
const missingVars: string[] = []
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.includes('PLACEHOLDER') || value.includes('DEMO')) {
        missingVars.push(`NEXT_PUBLIC_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`)
    }
})

if (missingVars.length > 0) {
    console.error('❌ [Firebase] Variáveis de ambiente faltando ou inválidas:')
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`)
    })
    console.error('\n📝 Crie o arquivo .env.local na raiz do projeto com suas credenciais do Firebase Console.')
    console.error('   Exemplo: https://console.firebase.google.com/ → Configurações do Projeto → SDK setup')
}

// Firebase configuration usando variáveis de ambiente
const firebaseConfig = {
    apiKey: requiredEnvVars.apiKey!,
    authDomain: requiredEnvVars.authDomain!,
    projectId: requiredEnvVars.projectId!,
    storageBucket: requiredEnvVars.storageBucket!,
    messagingSenderId: requiredEnvVars.messagingSenderId!,
    appId: requiredEnvVars.appId!
}

console.log('🔧 [Firebase] Configuração carregada:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasValidApiKey: firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PLACEHOLDER')
})

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

console.log('✅ [Firebase] Serviços inicializados com sucesso')

export default app
