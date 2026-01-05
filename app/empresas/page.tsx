"use client"

import { Suspense, useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation" // <--- IMPORTANTE
import { Search, Filter, Building2, FileCheck, AlertCircle, Plus, Loader2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { AppHeader } from "@/components/layout/AppHeader"

function EmpresasContent() {
  const router = useRouter() // <--- Hook de navegação
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [empresas, setEmpresas] = useState<any[]>([])
  const [vencimentosStats, setVencimentosStats] = useState({ validos: 0, vencendoEmBreve: 0, vencidosPendentes: 0 })

  // Estado de carregamento dos DADOS (Empresas)
  const [dataLoading, setDataLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Pegamos o loading do AUTH também
  const { user, loading: authLoading } = useAuth()
  const userUID = user?.uid

  // 1. EFEITO DE PROTEÇÃO DE ROTA (A CORREÇÃO PRINCIPAL)
  useEffect(() => {
    // Se o Firebase terminou de carregar (authLoading false) E não tem usuário...
    if (!authLoading && !user) {
      console.warn("⛔ [Empresas] Acesso não autorizado. Redirecionando...")
      router.push('/login')
    }
  }, [user, authLoading, router])

  // 2. EFEITO DE BUSCA DE DADOS
  useEffect(() => {
    // Só busca se tivermos certeza de quem é o usuário
    if (userUID) {
      console.log('[Empresas] userUID confirmado:', userUID)
      fetchEmpresas()
      fetchVencimentosStats()
    }
  }, [userUID]) // Removemos o 'loading' daqui para não disparar fetchs duplicados

  const fetchEmpresas = async () => {
    // Dupla verificação de segurança
    if (!userUID) return

    try {
      const params = new URLSearchParams({ donoUid: userUID })
      if (user?.email) params.append('donoEmail', user.email)

      const response = await fetch(`http://localhost:3001/api/empresas?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setEmpresas(data)
      } else {
        console.error('[Empresas] Erro API:', data)
      }
    } catch (error) {
      console.error('[Empresas] Erro fetch:', error)
    } finally {
      setDataLoading(false) // Desliga o loading dos DADOS
    }
  }

  const fetchVencimentosStats = async () => {
    if (!userUID) return

    try {
      const response = await fetch(`http://localhost:3001/api/empresas/vencimentos-stats?donoUid=${userUID}`)
      const data = await response.json()
      if (response.ok) setVencimentosStats(data)
    } catch (error) {
      console.error("Erro stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Lógica de Filtro
  const filteredEmpresas = empresas.filter((f) => {
    const nomeEmpresa = f.razaoSocial || f.nome || "";
    const cidadeEmpresa = f.cidadeSede || f.cidade || "";
    const matchesSearch =
      nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cnpj.includes(searchTerm) ||
      (cidadeEmpresa && cidadeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "todos" || f.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // --- RENDERIZAÇÃO CONDICIONAL (O SEGREDO DA UX) ---

  // Se o Firebase ainda está verificando se está logado, mostre um spinner de tela cheia
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está logado (e já passou pelo useEffect de redirect), retorna null para não piscar a tela
  if (!user) return null

  // Se chegou aqui, ESTÁ LOGADO. Renderiza a página normal.
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <Link href="/" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground">
              Inicial
            </Link>
            <Link href="/empresas" className="py-3 px-1 border-b-2 border-primary text-sm font-medium text-foreground">
              Minhas Empresas
            </Link>
            <Link href="/notificacoes" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground">
              Notificações
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-foreground mb-2">Minhas Empresas</h2>
            <p className="text-muted-foreground">Gerencie suas empresas e os respectivos documentos</p>
          </div>
          <Link href="/empresas/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Válidos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : vencimentosStats.validos}
                  </p>
                </div>
                <FileCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vencendo em breve</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : vencimentosStats.vencendoEmBreve}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vencidos/Pendentes</p>
                  <p className="text-2xl font-bold text-red-500">
                    {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : vencimentosStats.vencidosPendentes}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CNPJ ou cidade..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Usa dataLoading aqui, não o loading geral */}
                  {dataLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredEmpresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          {empresa.razaoSocial || empresa.nome}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{empresa.cnpj}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={empresa.segmento || empresa.categoria}>
                          {empresa.segmento || empresa.categoria}
                        </div>
                      </TableCell>
                      <TableCell>{empresa.cidadeSede || empresa.cidade}</TableCell>
                      <TableCell>
                        <Badge variant={(empresa.status || 'ativo') === "ativo" ? "default" : "secondary"}>
                          {(empresa.status || 'ativo').charAt(0).toUpperCase() + (empresa.status || 'ativo').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/empresas/${empresa.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {!dataLoading && filteredEmpresas.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma empresa encontrada</h3>
                <p className="text-muted-foreground">Clique em "Nova Empresa" para começar seu cadastro</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function FornecedoresPage() {
  return (
    <Suspense fallback={null}>
      <EmpresasContent />
    </Suspense>
  )
}