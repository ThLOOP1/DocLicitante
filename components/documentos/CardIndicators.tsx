"use client"

import type { CardIndicatorsProps } from "./types"

/**
 * CardIndicators - Indicadores de Validade
 * Single Responsibility: Exibir contador de dias restantes e status de validade
 */
export function CardIndicators({ documento, statusInfo }: CardIndicatorsProps) {
    return (
        <div className="text-right hidden sm:block">
            <span
                className={`text-sm font-semibold ${documento.placeholder
                        ? "text-muted-foreground"
                        : statusInfo.cor
                    }`}
            >
                {documento.placeholder || statusInfo.diasRestantes === null
                    ? "--"
                    : Math.abs(statusInfo.diasRestantes)}
                {!documento.placeholder && statusInfo.diasRestantes !== null && (
                    <> {Math.abs(statusInfo.diasRestantes) === 1 ? " dia" : " dias"}</>
                )}
            </span>
            <p className="text-xs text-muted-foreground">
                {documento.placeholder
                    ? "pendente"
                    : statusInfo.diasRestantes === null
                        ? "sem data"
                        : statusInfo.diasRestantes < 0
                            ? "vencido"
                            : "restantes"}
            </p>
        </div>
    )
}
