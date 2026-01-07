"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { useProfileData } from "@/hooks/useProfileData"
import { ProfileSidebar } from "@/components/perfil/ProfileSidebar"
import { PersonalInfoForm } from "@/components/perfil/PersonalInfoForm"
import { AddressForm } from "@/components/perfil/AddressForm"
import { SecuritySection } from "@/components/perfil/SecuritySection"
import { ProfileSkeleton } from "@/components/perfil/ProfileSkeleton"

export default function PerfilPage() {
  const { user, userData: authUserData, loading: authLoading } = useAuth()
  const userUID = user?.uid

  const {
    userData,
    updateUserData,
    updateAddress,
    saveProfile,
    loading,
    saving
  } = useProfileData(authUserData, user?.email ?? undefined, authLoading)

  const [isEditing, setIsEditing] = useState(false)
  const [empresasCadastradas, setEmpresasCadastradas] = useState<any[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)

  useEffect(() => {
    // Cláusula de guarda: só buscar empresas se userUID estiver disponível
    if (!userUID) {
      console.log('[Perfil] userUID ainda não disponível, aguardando...')
      return
    }

    console.log('[Perfil] userUID disponível, buscando empresas:', userUID)
    fetchEmpresas()
  }, [userUID])

  const fetchEmpresas = async () => {
    if (!userUID) {
      console.warn('[Perfil] userUID não disponível, pulando busca de empresas')
      setLoadingEmpresas(false)
      return
    }

    console.log('[Perfil] Iniciando busca de empresas para UID:', userUID)
    console.log('[Perfil] Email do usuário:', user?.email)

    try {
      // Passar tanto UID quanto email para o backend ter opções de busca
      const params = new URLSearchParams({
        donoUid: userUID
      })

      if (user?.email) {
        params.append('donoEmail', user.email)
      }

      const url = `/api/empresas?${params.toString()}`
      console.log('[Perfil] URL da requisição:', url)

      const response = await fetch(url)
      console.log('[Perfil] Status da resposta:', response.status, response.statusText)

      const data = await response.json()
      console.log('[Perfil] Empresas recebidas:', data.length, 'empresas')
      console.log('[Perfil] Dados:', data)

      if (response.ok) {
        setEmpresasCadastradas(data)
      } else {
        console.error('[Perfil] Erro na resposta da API:', data)
      }
    } catch (error) {
      console.error('[Perfil] Erro ao carregar empresas:', error)
    } finally {
      setLoadingEmpresas(false)
      console.log('[Perfil] Busca de empresas finalizada')
    }
  }

  const handleSaveProfile = async () => {
    if (!userUID) return

    const success = await saveProfile(userUID)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleDeleteEmpresa = async (e: React.MouseEvent, id: string, nome: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Tem certeza que deseja excluir a empresa "${nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const response = await fetch(`/api/empresas/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Empresa excluída com sucesso!")
        setEmpresasCadastradas(prev => prev.filter(emp => emp.id !== id))
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao excluir empresa")
      }
    } catch (error) {
      console.error("Erro ao excluir empresa", error)
      toast.error("Erro de conexão com o servidor")
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/Dashboard" className="flex items-center gap-2">
                <FileCheck className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">DocLicitante</h1>
              </Link>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <Link href="/Dashboard" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground">
              Inicial
            </Link>
            <Link href="/empresas" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground">
              Minhas Empresas
            </Link>
            <Link href="/notificacoes" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground">
              Notificações
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Meu Perfil</h2>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e empresas cadastradas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              userData={userData}
              empresas={empresasCadastradas}
              loadingEmpresas={loadingEmpresas}
              onDeleteEmpresa={handleDeleteEmpresa}
            />
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoForm
              userData={userData}
              isEditing={isEditing}
              saving={saving}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
              onSave={handleSaveProfile}
              onChange={updateUserData}
            />

            <Card>
              <CardContent className="pt-6">
                <AddressForm
                  endereco={userData.endereco!}
                  isEditing={isEditing}
                  onChange={updateAddress}
                />
              </CardContent>
            </Card>

            <SecuritySection userUID={userUID} />
          </div>
        </div>
      </main>
    </div>
  )
}
