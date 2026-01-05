"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Bell, Building2, FileCheck, AlertCircle, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { toast } from "sonner"
import { formatarDataBR } from "@/lib/formatters"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    totalEmpresas: 0,
    certidoesVencendo: 0,
    documentosValidos: 0,
    solicitacoesPendentes: 0,
    alertas: []
  })

  const { user } = useAuth()
  const userUID = user?.uid

  useEffect(() => {
    const fetchStats = async () => {
      // Guard clause: não fazer requisição se userUID não estiver disponível
      if (!userUID || userUID === 'undefined') {
        console.log('[Dashboard] Aguardando autenticação do usuário...')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:3001/api/dashboard/stats?donoUid=${userUID}`)
        const data = await response.json()
        if (response.ok) {
          setStatsData(data)
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [userUID])

  const stats = [
    {
      title: "Empresas Cadastradas",
      value: statsData.totalEmpresas.toString(),
      change: "Minhas empresas",
      icon: Building2,
      trend: "up",
    },
    {
      title: "Certidões Vencendo",
      value: statsData.certidoesVencendo.toString(),
      change: "Próximos 15 dias",
      icon: AlertCircle,
      trend: "warning",
    },
    {
      title: "Documentos Válidos",
      value: statsData.documentosValidos.toString(),
      change: "> 15 dias para vencer",
      icon: FileCheck,
      trend: "up",
    },
    /* {
      title: "Solicitações Pendentes",
      value: statsData.solicitacoesPendentes.toString(),
      change: "Ações necessárias",
      icon: Users,
      trend: "neutral",
    }, */
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">DocLicitante</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {statsData.certidoesVencendo > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                    {statsData.certidoesVencendo}
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
              href="/"
              className="py-3 px-1 border-b-2 border-primary text-sm font-medium text-foreground"
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
              className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Notificações
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Bem-vindo de volta ao seu painel de controle</p>
          </div>
          <div className="flex gap-4">
            <Link href="/empresas/novo">
              <Button className="gap-2">
                <Building2 className="h-4 w-4" />
                Nova Empresa
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.trend === 'warning' ? 'text-warning' :
                  stat.trend === 'up' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Certidões Próximas do Vencimento</CardTitle>
                  <CardDescription>Documentos que expiram em menos de 15 dias</CardDescription>
                </div>
                <Badge variant="outline" className="bg-transparent">Urgent</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : statsData.alertas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma certidão vencendo nos próximos 15 dias.</p>
                ) : (
                  statsData.alertas.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${alert.status === 'vencido' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.nome || "Certidão"}</p>
                          <p className="text-xs text-muted-foreground">{alert.nomeEmpresa}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">Vencimento</p>
                          <p className={`text-xs ${alert.status === 'vencido' ? 'text-destructive' : 'text-warning'}`}>
                            {formatarDataBR(alert.dataVencimento)}
                          </p>
                        </div>
                        <Link href={`/empresas/${alert.empresaId}`}>
                          <Button variant="ghost" size="sm">Ver detalhes</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>O que você deseja fazer agora?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/empresas/novo" className="block w-full">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Building2 className="h-4 w-4" />
                  Cadastrar Empresa
                </Button>
              </Link>
              <Link href="/perfil" className="block w-full">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Users className="h-4 w-4" />
                  Meu Perfil
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                <FileCheck className="h-4 w-4" />
                Validar Documentos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
