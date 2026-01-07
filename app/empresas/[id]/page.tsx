"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import Link from "next/link"

// Hooks e Componentes Modulares
import { useDocumentos } from "@/hooks/useDocumentos"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppNav } from "@/components/layout/AppNav"
import { EmpresaInfoCard } from "@/components/empresa/EmpresaInfoCard"
import { NovoDocumentoModal } from "@/components/documentos/NovoDocumentoModal"
import { FloatingActionMenu } from "@/components/documentos/FloatingActionMenu"
import { NovaCategoriaModal } from "@/components/documentos/NovaCategoriaModal"
import { EmpresaStatsCards } from "@/components/documentos/EmpresaStatsCards"
import { DocumentTabsManager } from "@/components/documentos/DocumentTabsManager"

export default function EmpresaDetalhesPage() {
  const params = useParams()
  const id = params.id as string

  const [empresa, setEmpresa] = useState<any>(null)
  const [loadingEmpresa, setLoadingEmpresa] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'validos' | 'vencendo' | 'vencidos'>('todos')
  const [modalNovoDocAberto, setModalNovoDocAberto] = useState(false)
  const [modalNovaCategoriaAberto, setModalNovaCategoriaAberto] = useState(false)

  // Hook SOLID de Documentos
  const {
    certidoes,
    docsGerais,
    loading: loadingDocs,
    uploading,
    allCategories,
    fetchDocumentos,
    handleFileUpload,
    handleDeleteDocumento
  } = useDocumentos({ empresaId: id })

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await fetch(`/api/empresas/${id}`)
        if (response.ok) {
          const data = await response.json()
          setEmpresa(data)
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da empresa:", error)
      } finally {
        setLoadingEmpresa(false)
      }
    }

    if (id) fetchEmpresa()
  }, [id])

  // Lógica de Filtro
  const documentosFiltrados = certidoes.filter((c) => {
    if (filtroAtivo === 'todos') return true
    if (filtroAtivo === 'validos') return !c.placeholder && c.diasAVencer !== null && c.diasAVencer > 15
    if (filtroAtivo === 'vencendo') return !c.placeholder && c.diasAVencer !== null && c.diasAVencer >= 0 && c.diasAVencer <= 15
    if (filtroAtivo === 'vencidos') return c.placeholder || c.diasAVencer === null || c.diasAVencer < 0
    return true
  })

  // Handlers Modificados para Orquestrar UI
  const onUpload = (e: React.FormEvent<HTMLFormElement>) => {
    const tipo = editingId?.includes('geral') ? 'geral' : 'certidao'
    handleFileUpload(e, tipo as any, () => setEditingId(null))
  }

  const handleCriarNovoDocumento = async (nome: string, categoria: string) => {
    try {
      const response = await fetch(`/api/empresas/${id}/custom-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, categoria, empresaId: id, tipo: 'certidao', placeholder: true })
      })
      if (response.ok) {
        toast.success(`Documento "${nome}" criado!`)
        fetchDocumentos()
      }
    } catch (error) {
      toast.error("Erro ao criar documento.")
    }
  }

  const handleCriarNovaCategoria = async (nome: string) => {
    try {
      const response = await fetch(`/api/empresas/${id}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      })
      if (response.ok) {
        toast.success(`Categoria "${nome}" criada!`)
        window.location.reload()
      }
    } catch (error) {
      toast.error("Erro ao criar categoria.")
    }
  }

  if (loadingEmpresa || loadingDocs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">Sincronizando base documental...</p>
        </div>
      </div>
    )
  }

  if (!empresa) return null

  // Estatísticas para os cards
  // const stats = {
  //   validos: certidoes.filter((c) => !c.placeholder && c.diasAVencer !== null && c.diasAVencer > 15).length,
  //   vencendo: certidoes.filter((c) => !c.placeholder && c.diasAVencer !== null && c.diasAVencer >= 0 && c.diasAVencer <= 15).length,
  //   vencidos: certidoes.filter((c) => c.placeholder || c.diasAVencer === null || c.diasAVencer < 0).length
  // }

  // Lógica de cálculo LOCAL (Baseada nos documentos carregados na tela)
  const stats = {
    // 🟢 Válidos: Mais de 15 dias
    validos: certidoes.filter((c) =>
      !c.placeholder &&
      c.diasAVencer !== null &&
      c.diasAVencer > 15
    ).length,

    // 🟡 Vencendo (Correção): De 0 a 15 dias (incluindo o dia 0 e o 15)
    // Antes estava >= 11, por isso o documento de 7 dias não aparecia aqui!
    vencendo: certidoes.filter((c) =>
      !c.placeholder &&
      c.diasAVencer !== null &&
      c.diasAVencer >= 0 &&
      c.diasAVencer <= 15
    ).length,

    // 🔴 Vencidos (Correção): Apenas menor que 0 (negativo)
    // Antes estava <= 10, roubando documentos que deveriam ser amarelos
    vencidos: certidoes.filter((c) =>
      c.placeholder ||
      c.diasAVencer === null ||
      c.diasAVencer < 0
    ).length
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AppNav />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/empresas">
            <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar para Empresas
            </Button>
          </Link>
        </div>

        <EmpresaInfoCard empresa={empresa} />

        <EmpresaStatsCards
          {...stats}
          filtroAtivo={filtroAtivo}
          onFiltroChange={setFiltroAtivo}
        />

        <Tabs defaultValue="todos" className="w-full">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between px-0 pb-6 mb-2 space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Base Documental</CardTitle>
                <CardDescription>
                  {filtroAtivo === 'todos' ? 'Gerenciamento completo de documentos' : `Filtro ativo: ${filtroAtivo}`}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="gap-2 shadow-sm border-primary/20 hover:bg-primary/5 text-primary"
                onClick={() => window.location.href = `/api/empresas/${id}/documentos/download-all`}
              >
                <Download className="h-4 w-4" /> Download ZIP Completo
              </Button>
            </CardHeader>

            <DocumentTabsManager
              categories={allCategories}
              documentos={documentosFiltrados}
              docsGerais={docsGerais}
              editingId={editingId}
              uploading={uploading}
              filtroAtivo={filtroAtivo}
              onToggleEdit={(sid) => setEditingId(prev => prev === sid ? null : sid)}
              onDelete={handleDeleteDocumento}
              onUpload={onUpload}
            />
          </Card>
        </Tabs>

        <FloatingActionMenu
          onNovoDocumento={() => setModalNovoDocAberto(true)}
          onNovaCategoria={() => setModalNovaCategoriaAberto(true)}
        />

        <NovoDocumentoModal
          open={modalNovoDocAberto}
          onOpenChange={setModalNovoDocAberto}
          onCriar={handleCriarNovoDocumento}
          empresaId={id}
        />

        <NovaCategoriaModal
          open={modalNovaCategoriaAberto}
          onOpenChange={setModalNovaCategoriaAberto}
          onCriar={handleCriarNovaCategoria}
        />
      </main>
    </div>
  )
}
