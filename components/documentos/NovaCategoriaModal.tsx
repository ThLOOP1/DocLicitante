"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderPlus } from "lucide-react"

interface NovaCategoriaModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCriar: (nomeCategoria: string) => void
}

export function NovaCategoriaModal({ open, onOpenChange, onCriar }: NovaCategoriaModalProps) {
    const [nomeCategoria, setNomeCategoria] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (nomeCategoria.trim()) {
            onCriar(nomeCategoria.trim())
            setNomeCategoria("")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FolderPlus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Criar Nova Categoria</DialogTitle>
                            <DialogDescription>
                                Adicione uma nova seção para organizar seus documentos
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nomeCategoria">Nome da Categoria *</Label>
                        <Input
                            id="nomeCategoria"
                            placeholder="Ex: Alvarás Específicos, Licenças Ambientais..."
                            value={nomeCategoria}
                            onChange={(e) => setNomeCategoria(e.target.value)}
                            required
                            className="bg-white"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            Esta categoria aparecerá como uma nova seção na página
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setNomeCategoria("")
                                onOpenChange(false)
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!nomeCategoria.trim()}>
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Criar Categoria
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
