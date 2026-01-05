"use client"

import { FileCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatarDataBR } from "@/lib/formatters"
import type { CardHeaderProps } from "./types"

/**
 * CardHeader - Cabeçalho do Documento
 * Single Responsibility: Exibir informações básicas do documento (ícone, nome, badge, metadados)
 */
export function CardHeader({ documento, statusInfo, isAttached }: CardHeaderProps) {
    return (
        <div className="flex items-center gap-4 flex-1">
            {/* Ícone do Documento */}
            <div
                className={`p-2 rounded-md ${documento.placeholder ? "bg-muted" : "bg-blue-50"
                    }`}
            >
                <FileCheck
                    className={`h-5 w-5 ${documento.placeholder ? "text-muted-foreground" : "text-blue-600"
                        }`}
                />
            </div>

            {/* Informações do Documento */}
            <div className="flex-1">
                {/* Nome e Badge */}
                <div className="flex items-center gap-3">
                    {isAttached && documento.arquivo?.url ? (
                        <a
                            href={documento.arquivo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline text-sm lg:text-base"
                        >
                            {documento.nome}
                        </a>
                    ) : (
                        <h4 className="font-semibold text-foreground text-sm lg:text-base">
                            {documento.nome}
                        </h4>
                    )}

                    <Badge
                        variant={documento.placeholder ? "secondary" : statusInfo.badgeVariant}
                        className={
                            documento.placeholder
                                ? "bg-muted text-muted-foreground"
                                : statusInfo.badgeVariant === 'warning'
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                    : statusInfo.badgeVariant === 'success'
                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                        : ""
                        }
                    >
                        {documento.placeholder ? "Pendente" : statusInfo.badge}
                    </Badge>
                </div>

                {/* Metadados */}
                <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-muted-foreground">
                        {documento.identificacao && (
                            <span className="mr-3">ID: {documento.identificacao}</span>
                        )}
                        {documento.dataEmissao && (
                            <span className="mr-3">
                                Emissão: {formatarDataBR(documento.dataEmissao)}
                            </span>
                        )}
                        <span>
                            Validade:{" "}
                            {documento.placeholder || !documento.dataVencimento
                                ? "Não anexado"
                                : formatarDataBR(documento.dataVencimento)}
                        </span>
                    </p>

                    {/* Status Text */}
                    {!documento.placeholder && documento.dataVencimento && (
                        <p className={`text-xs font-medium ${statusInfo.cor}`}>
                            {statusInfo.texto}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
