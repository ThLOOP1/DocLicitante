"use client"

import { Building2, MapPin, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empresa } from "@/types/empresa"
import { formatCNPJ, formatPhone } from "@/utils/masks"

interface EmpresaInfoCardProps {
    empresa: Empresa
}

export function EmpresaInfoCard({ empresa }: EmpresaInfoCardProps) {
    if (!empresa) return null

    return (
        <Card className="mb-6">
            <CardContent className="pt-6 flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground mb-1">
                            {empresa.razaoSocial}
                        </h2>
                        {empresa.nomeFantasia && (
                            <p className="text-sm text-muted-foreground mb-2">
                                {empresa.nomeFantasia}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-3 font-mono">
                            CNPJ: {formatCNPJ(empresa.cnpj)}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />{" "}
                                {empresa.cidadeSede || empresa.endereco?.cidade}
                                {empresa.endereco?.estado && `, ${empresa.endereco.estado}`}
                            </span>
                            {(empresa.contato?.telefone || empresa.telefone) && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />{" "}
                                    {formatPhone(empresa.contato?.telefone || empresa.telefone)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Badge
                    className={
                        empresa.status === "ativo" ? "bg-green-600" : "bg-yellow-500"
                    }
                >
                    {empresa.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
            </CardContent>
        </Card>
    )
}
