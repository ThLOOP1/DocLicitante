"use client"

import { Suspense } from "react"
import { FileCheck, Clock, CheckCircle, XCircle, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { formatarDataBR } from "@/lib/formatters"

function SolicitacoesContent() {
  const solicitacoes = [
    {
      id: 1,
      empresa: "Nova Empresa LTDA",
      tipo: "Novo Cadastro",
      data: "2024-01-10",
      status: "pendente",
      responsavel: "João Silva",
    },
    {
      id: 2,
      empresa: "Tech Solutions Brasil S.A.",
      tipo: "Atualização de Documentos",
      data: "2024-01-09",
      status: "em-analise",
      responsavel: "Maria Santos",
    },
    {
      id: 3,
      empresa: "Construtora Silva & Cia LTDA",
      tipo: "Renovação de Certidão",
      data: "2024-01-08",
      status: "aprovado",
      responsavel: "Pedro Costa",
    },
    {
      id: 4,
      empresa: "Serviços Gerais ME",
      tipo: "Novo Cadastro",
      data: "2024-01-07",
      status: "rejeitado",
      responsavel: "Ana Oliveira",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>
      case "em-analise":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Em Análise</Badge>
      case "aprovado":
        return <Badge className="bg-green-600 hover:bg-green-700">Aprovado</Badge>
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
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
              className="py-3 px-1 border-b-2 border-primary text-sm font-medium text-foreground"
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
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Solicitações</h2>
          <p className="text-muted-foreground">Gerencie solicitações de cadastro e atualizações</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {solicitacoes.filter((s) => s.status === "pendente").length}
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
                  <p className="text-sm text-muted-foreground mb-1">Em Análise</p>
                  <p className="text-2xl font-bold text-foreground">
                    {solicitacoes.filter((s) => s.status === "em-analise").length}
                  </p>
                </div>
                <FileCheck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Aprovadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {solicitacoes.filter((s) => s.status === "aprovado").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rejeitadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {solicitacoes.filter((s) => s.status === "rejeitado").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar solicitações..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Solicitações</CardTitle>
            <CardDescription>Solicitações recentes de empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((solicitacao) => (
                  <TableRow key={solicitacao.id}>
                    <TableCell className="font-medium">{solicitacao.empresa}</TableCell>
                    <TableCell>{solicitacao.tipo}</TableCell>
                    <TableCell>{formatarDataBR(solicitacao.data)}</TableCell>
                    <TableCell>{solicitacao.responsavel}</TableCell>
                    <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function SolicitacoesPage() {
  return (
    <Suspense fallback={null}>
      <SolicitacoesContent />
    </Suspense>
  )
}
