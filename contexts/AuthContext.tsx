"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface AuthContextType {
    user: User | null
    userData: any | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, nome: string, cargo?: string) => Promise<void>
    logout: () => Promise<void>
    resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        console.log('[AuthContext] Inicializando listener de autenticação...')
        let isMounted = true // Flag para verificar se o componente ainda está montado

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('🆔 [AUTH] UID Logado:', user?.uid || 'null', '| Email:', user?.email || 'null')

            // Verificar se o componente ainda está montado antes de atualizar estado
            if (!isMounted) {
                console.log('[AuthContext] Componente desmontado, cancelando atualização de estado')
                return
            }

            setUser(user)

            if (user) {
                console.log('[AuthContext] Buscando dados do usuário no Firestore, UID:', user.uid)
                try {
                    // Tentativa 1: Buscar pelo UID do Auth
                    let userDoc = await getDoc(doc(db, 'usuarios', user.uid))
                    console.log('📄 [DB] Documento encontrado por UID:', userDoc.exists())

                    // Tentativa 2: Se não encontrar por UID, buscar por email
                    if (!userDoc.exists() && user.email) {
                        console.log('[AuthContext] Documento não encontrado por UID, tentando buscar por email:', user.email)
                        const { collection, query, where, getDocs } = await import('firebase/firestore')
                        const q = query(collection(db, 'usuarios'), where('email', '==', user.email))
                        const querySnapshot = await getDocs(q)

                        if (!querySnapshot.empty) {
                            userDoc = querySnapshot.docs[0]
                            console.log('📄 [DB] Documento encontrado por email! ID:', userDoc.id)
                        } else {
                            console.warn('[AuthContext] Nenhum documento encontrado nem por UID nem por email')
                        }
                    }

                    // Verificar novamente se ainda está montado antes de atualizar
                    if (!isMounted) {
                        console.log('[AuthContext] Componente desmontado durante busca, cancelando')
                        return
                    }

                    if (userDoc.exists()) {
                        const data = userDoc.data()
                        console.log('[AuthContext] Dados do usuário carregados:', data)
                        setUserData(data)
                    } else {
                        console.warn('[AuthContext] Documento não encontrado para UID:', user.uid)
                        setUserData(null)
                    }
                } catch (error) {
                    console.error('[AuthContext] Erro ao buscar dados do usuário:', error)
                    if (isMounted) {
                        setUserData(null)
                    }
                }
            } else {
                console.log('[AuthContext] Nenhum usuário autenticado')
                if (isMounted) {
                    setUserData(null)
                }
            }

            if (isMounted) {
                setLoading(false)
                console.log('[AuthContext] Loading finalizado')
            }
        })

        // Cleanup: desinscrever listener e marcar componente como desmontado
        return () => {
            console.log('[AuthContext] Limpando listener de autenticação...')
            isMounted = false
            unsubscribe()
        }
    }, [])

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
    }

    const register = async (email: string, password: string, nome: string, cargo?: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
            nome,
            email,
            cargo: cargo || 'Usuário',
            criadoEm: new Date().toISOString()
        })
    }

    const logout = async () => {
        await signOut(auth)
    }

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email)
    }

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, register, logout, resetPassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
