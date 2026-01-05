"use client"

import { Download, Trash2, ChevronUp, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CardActionsProps } from "./types"

/**
 * CardActions - Botões de Ação
 * Single Responsibility: Gerenciar as ações disponíveis para o documento
 * 
 * IMPORTANTE: Este componente isola completamente o evento de clique do botão de edição,
 * evitando qualquer interferência de outros elementos do card.
 */
export function CardActions({
    documento,
    isEditing,
    isAttached,
    onToggleEdit,
    onDelete,
}: CardActionsProps) {
    return (
        <div className="flex items-center gap-1">
            {/* Botões visíveis apenas para documentos anexados (modo visualização) */}
            {isAttached && !isEditing && (
                <>
                    {/* Botão Download */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (documento.arquivo?.url) {
                                window.open(documento.arquivo.url)
                            }
                        }}
                        title="Baixar documento"
                    >
                        <Download className="h-4 w-4" />
                    </Button>

                    {/* Botão Deletar */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (documento.id) {
                                onDelete(documento.id)
                            }
                        }}
                        title="Deletar documento"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            )}

            {/* Botão Editar/Lápis - SEMPRE VISÍVEL */}
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    // CRÍTICO: Isolamento completo do evento
                    e.preventDefault()
                    e.stopPropagation()

                    // Logs de diagnóstico
                    console.log('🖱️ [ACTIONS] Clique no botão de edição')
                    console.log('🖱️ [ACTIONS] Documento:', documento.nome)
                    console.log('🖱️ [ACTIONS] Estado atual isEditing:', isEditing)

                    // Chamada direta e isolada
                    onToggleEdit()
                }}
                className={`
                    relative z-10
                    h-10 w-10
                    p-2.5
                    ml-2
                    transition-all
                    pointer-events-auto
                    cursor-pointer
                    ${isEditing
                        ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                        : 'hover:bg-accent'
                    }
                `}
                title={
                    documento.placeholder
                        ? "Anexar documento"
                        : isEditing
                            ? "Cancelar edição"
                            : "Substituir documento"
                }
            >
                {isEditing ? (
                    <ChevronUp className="h-5 w-5" />
                ) : (
                    <Pencil className="h-5 w-5" />
                )}
            </Button>
        </div>
    )
}
