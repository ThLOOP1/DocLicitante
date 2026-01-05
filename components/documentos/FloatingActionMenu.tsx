"use client"

import { useState } from "react"
import { Plus, FileText, FolderPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingActionMenuProps {
    onNovoDocumento: () => void
    onNovaCategoria: () => void
}

export function FloatingActionMenu({ onNovoDocumento, onNovaCategoria }: FloatingActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    console.log('🔘 [FAB] Menu aberto:', isOpen);

    return (
        // CRÍTICO: pointer-events-none no container para não bloquear cliques na página
        <div className="fixed bottom-8 right-8 z-[100] pointer-events-none" id="fab-menu-container">
            {/* Menu de opções - aparece quando aberto */}
            <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}>

                {/* Opção: Criar Nova Categoria */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium bg-white px-3 py-2 rounded-lg shadow-md whitespace-nowrap pointer-events-auto">
                        Nova Categoria
                    </span>
                    <Button
                        size="lg"
                        onClick={() => {
                            onNovaCategoria()
                            setIsOpen(false)
                        }}
                        className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 pointer-events-auto"
                    >
                        <FolderPlus className="h-5 w-5" />
                    </Button>
                </div>

                {/* Opção: Criar Novo Documento */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium bg-white px-3 py-2 rounded-lg shadow-md whitespace-nowrap pointer-events-auto">
                        Novo Documento
                    </span>
                    <Button
                        size="lg"
                        onClick={() => {
                            onNovoDocumento()
                            setIsOpen(false)
                        }}
                        className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 pointer-events-auto"
                    >
                        <FileText className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Botão principal */}
            <Button
                size="lg"
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pointer-events-auto ${isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
        </div>
    )
}
