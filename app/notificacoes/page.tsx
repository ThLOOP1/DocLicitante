"use client"

import { Suspense, useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Bell, FileCheck, AlertCircle, CheckCircle, Clock, Filter, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"

function NotificacoesContent() {
  const [activeTab, setActiveTab] = useState("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  const [lidasIds, setLidasIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotif, setSelectedNotif] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { user } = useAuth()
  const userUID = user?.uid

  useEffect(() => {
    // Guard clause: não fazer requisição se userUID não estiver disponível
    if (!userUID || userUID === 'undefined') {
      console.log('[Notificações] Aguardando autenticação do usuário...')
      setLoading(false)
      return
    }

    // Carregar IDs de notificações lidas do localStorage
    const savedLidas = localStorage.getItem(`notificacoes_lidas_${userUID}`)
    if (savedLidas) {
      setLidasIds(JSON.parse(savedLidas))
    }

    const fetchNotificacoes = async () => {
      try {
        const response = await fetch(`/api/notificacoes?donoUid=${userUID}`)
        const data = await response.json()
        if (response.ok) {
          // Mesclar status de "lida" local
          const updatedData = data.map((n: any) => ({
            ...n,
            lida: savedLidas ? JSON.parse(savedLidas).includes(n.id) : false
          }))
          setNotificacoes(updatedData)
        }
      } catch (error) {
        console.error("Erro ao carregar notificações", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotificacoes()
  }, [userUID])

  const handleMarkAsRead = (id: string) => {
    if (lidasIds.includes(id)) return;

    const newLidas = [...lidasIds, id]
    setLidasIds(newLidas)
    localStorage.setItem(`notificacoes_lidas_${userUID}`, JSON.stringify(newLidas))

    setNotificacoes(prev => prev.map(n =>
      n.id === id ? { ...n, lida: true } : n
    ))
  }

  const handleViewDetails = (notif: any) => {
    setSelectedNotif(notif)
    setIsModalOpen(true)
    handleMarkAsRead(notif.id)
  }

  const handleMarkAllAsRead = () => {
    const allIds = notificacoes.map(n => n.id)
    setLidasIds(allIds)
    localStorage.setItem(`notificacoes_lidas_${userUID}`, JSON.stringify(allIds))

    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
  }

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case "urgente":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "vencido":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "alerta":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "sucesso":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "info":
        return <Bell className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getBadgeByTipo = (tipo: string) => {
    switch (tipo) {
      case "urgente":
        return (
          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
            Urgente
          </Badge>
        )
      case "vencido":
        return <Badge variant="destructive">Vencido</Badge>
      case "alerta":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Alerta</Badge>
      case "sucesso":
        return <Badge className="bg-green-600 hover:bg-green-700">Sucesso</Badge>
      case "info":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
      default:
        return <Badge variant="outline">Outro</Badge>
    }
  }

  const filteredNotificacoes = notificacoes.filter((notif) => {
    const matchesSearch =
      notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.empresa.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = tipoFilter === "todos" || notif.tipo === tipoFilter

    const matchesTab =
      activeTab === "todas" || (activeTab === "nao-lidas" && !notif.lida) || (activeTab === "lidas" && notif.lida)

    return matchesSearch && matchesTipo && matchesTab
  })

  // Estatísticas baseadas nas regras do usuário
  const totalNotificacoes = notificacoes.length
  const naoLidasCount = notificacoes.filter((n) => !n.lida).length
  const urgentesCount = notificacoes.filter((n) => n.dias <= 10 && n.dias >= 1).length

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
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {naoLidasCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                    {naoLidasCount}
                  </span>
                )}
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <Link
              href="/Dashboard"
              className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Inicial
            </Link>
            <Link
              href="/empresas"
              className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Minhas Empresas
            </Link>
            {/* <Link
              href="/solicitacoes"
              className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Solicitações
            </Link> */}
            <Link
              href="/notificacoes"
              className="py-3 px-1 border-b-2 border-primary text-sm font-medium text-foreground"
            >
              Notificações
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Notificações</h2>
          <p className="text-muted-foreground">Acompanhe alertas e avisos sobre documentação</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Notificações</p>
                  <p className="text-2xl font-bold text-foreground">{totalNotificacoes}</p>
                </div>
                <Bell className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Não Lidas</p>
                  <p className="text-2xl font-bold text-yellow-500">{naoLidasCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Urgentes</p>
                  <p className="text-2xl font-bold text-red-500">{urgentesCount}</p>
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
                  placeholder="Buscar notificações..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="alerta">Alerta</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar Todas como Lidas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0">
            <TabsTrigger
              value="todas"
              className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="nao-lidas"
              className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent"
            >
              Não Lidas ({naoLidasCount})
            </TabsTrigger>
            <TabsTrigger
              value="lidas"
              className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent"
            >
              Lidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "todas"
                    ? "Todas as Notificações"
                    : activeTab === "nao-lidas"
                      ? "Notificações Não Lidas"
                      : "Notificações Lidas"}
                </CardTitle>
                <CardDescription>{filteredNotificacoes.length} notificação(ões) encontrada(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredNotificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${!notif.lida
                        ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-card hover:bg-accent/5"
                        }`}
                    >
                      <div className="mt-1">{getIconByTipo(notif.tipo)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{notif.titulo}</h4>
                              {!notif.lida && (
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" title="Não lida" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{notif.empresa}</p>
                            <p className="text-sm text-foreground">{notif.descricao}</p>
                          </div>
                          {getBadgeByTipo(notif.tipo)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(notif.data).toLocaleString("pt-BR")}</span>
                          {notif.dataVencimento && (
                            <>
                              <span>•</span>
                              <span>Vencimento: {new Date(notif.dataVencimento).toLocaleDateString("pt-BR")}</span>
                            </>
                          )}
                          {notif.dias !== null && (
                            <>
                              <span>•</span>
                              <span
                                className={`font-medium ${notif.dias < 0
                                  ? "text-red-500"
                                  : notif.dias <= 7
                                    ? "text-red-500"
                                    : notif.dias <= 15
                                      ? "text-yellow-500"
                                      : "text-green-600"
                                  }`}
                              >
                                {notif.dias < 0
                                  ? `Vencido há ${Math.abs(notif.dias)} dias`
                                  : `${notif.dias} dias restantes`}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-transparent"
                            onClick={() => handleViewDetails(notif)}
                          >
                            Ver Detalhes
                          </Button>
                          {!notif.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleMarkAsRead(notif.id)}
                            >
                              Marcar como Lida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredNotificacoes.length === 0 && (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma notificação encontrada</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || tipoFilter !== "todos"
                          ? "Tente ajustar os filtros"
                          : "Você está em dia com todas as notificações"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedNotif && getIconByTipo(selectedNotif.tipo)}
              <DialogTitle className="text-xl">{selectedNotif?.titulo}</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground leading-relaxed">
                    {selectedNotif?.descricao}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedNotif?.empresa}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="font-medium">
                      {selectedNotif?.dataVencimento ? new Date(selectedNotif.dataVencimento).toLocaleDateString("pt-BR") : "N/A"}
                    </p>
                  </div>
                </div>

                {selectedNotif && selectedNotif.dias !== null && (
                  <div className={`text-sm font-semibold p-2 rounded text-center ${selectedNotif.dias < 0 ? "bg-red-100 text-red-700" :
                    selectedNotif.dias <= 10 ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                    {selectedNotif.dias < 0
                      ? `Vencido há ${Math.abs(selectedNotif.dias)} dias`
                      : `Faltam ${selectedNotif.dias} dias para o vencimento`
                    }
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}

export default function NotificacoesPage() {
  return (
    <Suspense fallback={null}>
      <NotificacoesContent />
    </Suspense>
  )
}
