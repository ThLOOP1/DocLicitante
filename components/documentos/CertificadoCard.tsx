"use client"

import { calcularStatusDocumento } from "@/lib/formatters"
import { CardHeader } from "./CardHeader"
import { CardIndicators } from "./CardIndicators"
import { CardActions } from "./CardActions"
import { CardUploadForm } from "./CardUploadForm"
import type { CertificadoCardProps } from "./types"

/**
 * CertificadoCard - Componente Orquestrador
 * 
 * Single Responsibility: Orquestrar os sub-componentes e gerenciar o estado visual do card
 * 
 * Princípios SOLID aplicados:
 * - SRP: Cada sub-componente tem uma responsabilidade única
 * - OCP: Aberto para extensão (novos componentes podem ser adicionados)
 * - LSP: Componentes substituíveis mantêm o contrato
 * - ISP: Interfaces específicas para cada componente
 * - DIP: Componentes dependem de abstrações (interfaces em types.ts)
 */
export function CertificadoCard({
    certidao,
    isEditing,
    onToggleEdit,
    onDelete,
    onUpload,
    uploading,
}: CertificadoCardProps) {
    // Calcular informações derivadas
    const statusInfo = calcularStatusDocumento(certidao.dataVencimento)
    const isAttached = !certidao.placeholder && !!certidao.arquivo?.url

    // Log de renderização para debug
    console.log(`🗂️ [CARD] Renderizando ${certidao.nome} | isEditing: ${isEditing}`)

    return (
        <div
            key={certidao.id || certidao.nome}
            className={`
                relative z-0
                rounded-lg border overflow-hidden bg-white
                transition-all duration-200
                ${isEditing
                    ? "border-primary ring-2 ring-primary/20 shadow-md transform scale-[1.01]"
                    : "border-border hover:bg-accent/5"
                }
            `}
        >
            {/* Cabeçalho do Card */}
            <div className="flex items-center justify-between p-4">
                {/* Informações do Documento */}
                <CardHeader
                    documento={certidao}
                    statusInfo={statusInfo}
                    isAttached={isAttached}
                />

                {/* Indicadores de Validade */}
                <CardIndicators
                    documento={certidao}
                    statusInfo={statusInfo}
                />

                {/* Botões de Ação */}
                <CardActions
                    documento={certidao}
                    isEditing={isEditing}
                    isAttached={isAttached}
                    onToggleEdit={onToggleEdit}
                    onDelete={onDelete}
                />
            </div>

            {/* Formulário de Upload/Edição (exibido quando isEditing = true) */}
            {isEditing && (
                <CardUploadForm
                    documento={certidao}
                    isAttached={isAttached}
                    uploading={uploading}
                    onSubmit={onUpload}
                    onCancel={onToggleEdit}
                />
            )}
        </div>
    )
}
