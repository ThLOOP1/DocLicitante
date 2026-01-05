"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar, Building2, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"

interface ProfileSidebarProps {
    userData: {
        nome: string
        cpf: string
        email: string
        telefone?: string
        dataNascimento?: string
    }
    empresas: any[]
    loadingEmpresas: boolean
    onDeleteEmpresa: (e: React.MouseEvent, id: string, nome: string) => void
}

export function ProfileSidebar({ userData, empresas, loadingEmpresas, onDeleteEmpresa }: ProfileSidebarProps) {
    return (
        <>
            <Card>
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                {userData.nome ? userData.nome.substring(0, 2).toUpperCase() : "??"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-xl">{userData.nome || "Usuário"}</CardTitle>
                    <CardDescription>Pessoa Física</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">CPF:</span>
                        <span className="font-medium">{userData.cpf}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium truncate">{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="font-medium">{userData.telefone || "Não informado"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Nascimento:</span>
                        <span className="font-medium">
                            {userData.dataNascimento ? new Date(userData.dataNascimento).toLocaleDateString("pt-BR") : "Não informado"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">Minhas Empresas</CardTitle>
                    <CardDescription>Empresas cadastradas por você</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loadingEmpresas ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : empresas.length > 0 ? (
                        empresas.map((empresa) => (
                            <Link
                                key={empresa.id}
                                href={`/empresas/${empresa.id}`}
                                className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-foreground truncate">
                                            {empresa.razaoSocial || empresa.nomeFantasia || empresa.nome || "Empresa sem nome"}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono mt-1">{empresa.cnpj}</p>
                                        {empresa.cidade && (
                                            <p className="text-xs text-muted-foreground mt-1">{empresa.cidade}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Badge variant={(empresa.status || 'ativo') === "ativo" ? "default" : "secondary"}>
                                            {(empresa.status || 'ativo').charAt(0).toUpperCase() + (empresa.status || 'ativo').slice(1)}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            onClick={(e) => onDeleteEmpresa(e, empresa.id, empresa.razaoSocial || empresa.nomeFantasia || empresa.nome || "Empresa")}
                                            title="Excluir Empresa"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                            <p className="text-xs text-muted-foreground mt-1">Clique abaixo para cadastrar sua primeira empresa.</p>
                        </div>
                    )}
                    <Link href="/empresas/novo">
                        <Button variant="outline" className="w-full mt-2 bg-transparent">
                            Cadastrar Nova Empresa
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </>
    )
}
