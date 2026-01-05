import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'

export interface UserData {
    nome: string
    cpf: string
    email: string
    telefone?: string
    dataNascimento?: string
    genero?: 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar'
    cargo?: string
    endereco?: {
        cep: string
        logradouro: string
        numero: string
        complemento?: string
        bairro: string
        cidade: string
        estado: string
    }
    role?: string
    statusConta?: 'ativo' | 'pendente' | 'suspenso'
}

export function useProfileData(authUserData: any, userEmail: string | undefined, authLoading: boolean) {
    const [userData, setUserData] = useState<UserData>({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        genero: undefined,
        cargo: '',
        endereco: {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
        },
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        console.log('[useProfileData] authLoading:', authLoading, 'authUserData:', authUserData ? 'presente' : 'ausente')

        if (!authLoading) {
            if (authUserData) {
                console.log('[useProfileData] Mapeando dados do Firestore para o estado local')

                // Fallback inteligente: garantir que campos ausentes recebam valores padrão
                const mappedData: UserData = {
                    nome: authUserData.nome || '',
                    cpf: authUserData.cpf || '',
                    email: authUserData.email || userEmail || '',
                    telefone: authUserData.telefone || '',
                    dataNascimento: authUserData.dataNascimento || '',
                    genero: authUserData.genero || undefined,
                    cargo: authUserData.cargo || '',
                    // Compatibilidade: se o usuário antigo não tem objeto endereco, criar vazio
                    endereco: authUserData.endereco ? {
                        cep: authUserData.endereco.cep || '',
                        logradouro: authUserData.endereco.logradouro || '',
                        numero: authUserData.endereco.numero || '',
                        complemento: authUserData.endereco.complemento || '',
                        bairro: authUserData.endereco.bairro || '',
                        cidade: authUserData.endereco.cidade || '',
                        estado: authUserData.endereco.estado || '',
                    } : {
                        cep: '',
                        logradouro: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        estado: '',
                    },
                }

                console.log('[useProfileData] Dados mapeados:', mappedData)
                setUserData(mappedData)
            } else if (userEmail) {
                console.log('[useProfileData] Sem dados no Firestore, usando apenas email do Auth')
                // Caso não existam dados no Firestore, pelo menos preenchemos o email do Auth
                setUserData(prev => ({ ...prev, email: userEmail }))
            } else {
                console.warn('[useProfileData] Nenhum dado disponível (authUserData e userEmail ausentes)')
            }
            setLoading(false)
            console.log('[useProfileData] Loading finalizado')
        }
    }, [authUserData, userEmail, authLoading])

    const updateUserData = (field: string, value: any) => {
        setUserData((prev) => ({ ...prev, [field]: value }))
    }

    const updateAddress = (field: string, value: string) => {
        setUserData((prev) => ({
            ...prev,
            endereco: { ...prev.endereco!, [field]: value },
        }))
    }

    const saveProfile = async (userUID: string) => {
        setSaving(true)
        console.log('[useProfileData] Iniciando salvamento do perfil para UID:', userUID)
        console.log('[useProfileData] Dados a serem salvos:', {
            nome: userData.nome,
            telefone: userData.telefone,
            cpf: userData.cpf,
            dataNascimento: userData.dataNascimento,
            genero: userData.genero,
            cargo: userData.cargo,
            endereco: userData.endereco
        })

        try {
            await updateDoc(doc(db, 'usuarios', userUID), {
                nome: userData.nome,
                telefone: userData.telefone, // Salvo com máscara: (00) 00000-0000
                cpf: userData.cpf, // Salvo com máscara: 000.000.000-00
                dataNascimento: userData.dataNascimento,
                genero: userData.genero,
                cargo: userData.cargo,
                endereco: userData.endereco,
                updatedAt: new Date().toISOString(),
            })

            console.log('[useProfileData] Perfil salvo com sucesso no Firestore')
            toast.success('Perfil atualizado com sucesso!')
            return true
        } catch (error) {
            console.error('[useProfileData] Erro ao salvar perfil:', error)
            toast.error('Erro ao salvar alterações')
            return false
        } finally {
            setSaving(false)
            console.log('[useProfileData] Salvamento finalizado')
        }
    }

    return {
        userData,
        setUserData,
        updateUserData,
        updateAddress,
        saveProfile,
        loading,
        saving,
    }
}
