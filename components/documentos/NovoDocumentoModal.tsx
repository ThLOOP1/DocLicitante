"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface NovoDocumentoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCriar: (nome: string, categoria: string) => void
    empresaId: string
}

export function NovoDocumentoModal({ open, onOpenChange, onCriar, empresaId }: NovoDocumentoModalProps) {
    const [nome, setNome] = useState("")
    const [categoria, setCategoria] = useState("")
    const [categorias, setCategorias] = useState<string[]>([
        "Habilitação Jurídica",
        "Regularidade Fiscal/Trabalhista",
        "Qualificação Técnica",
        "Qualificação Econômico-Financeira",
        "Outros Documentos"
    ])

    useEffect(() => {
        if (open && empresaId) {
            const fetchCategorias = async () => {
                try {
                    const response = await fetch(`/api/empresas/${empresaId}/categorias`)
                    if (response.ok) {
                        const data = await response.json()
                        setCategorias(data.todas || data.padrao)
                    }
                } catch (error) {
                    console.error("Erro ao carregar categorias:", error)
                }
            }
            fetchCategorias()
        }
    }, [open, empresaId])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (nome.trim() && categoria) {
            onCriar(nome.trim(), categoria)
            setNome("")
            setCategoria("")
            onOpenChange(false)
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Adicionar Novo Documento
                    </DialogTitle>
                    <DialogDescription>
                        Crie um novo card de documento personalizado para esta empresa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Documento *</Label>
                            <Input
                                id="nome"
                                placeholder="Ex: Certidão Especial XYZ"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                className="bg-white"
                            />
                            <p className="text-xs text-muted-foreground">
                                Este será o título exibido no card
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria (Destino) *</Label>
                            <Select value={categoria} onValueChange={setCategoria} required>
                                <SelectTrigger id="categoria" className="bg-white">
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                O card será criado na seção correspondente
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!nome.trim() || !categoria}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Documento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
