"use client"

import {
    FileText,
    Download,
    Trash2,
    ChevronUp,
    Pencil,
    Loader2,
    Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatarDataInput } from "@/lib/formatters"

interface DocumentoGeralCardProps {
    doc: any
    isEditing: boolean
    onToggleEdit: () => void
    onDelete: (id: string) => void
    onUpload: (e: React.FormEvent<HTMLFormElement>) => void
    uploading: boolean
}

export function DocumentoGeralCard({
    doc,
    isEditing,
    onToggleEdit,
    onDelete,
    onUpload,
    uploading,
}: DocumentoGeralCardProps) {
    const isAttached = !!doc.arquivo?.url

    return (
        <div
            className={`rounded-lg border overflow-hidden bg-white transition-all duration-200 ${isEditing
                    ? "border-primary ring-2 ring-primary/20 shadow-md transform scale-[1.01]"
                    : "border-border hover:bg-accent/5"
                } shadow-sm`}
        >
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-md bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-foreground text-sm lg:text-base">{doc.nome}</h4>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                Válido
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {doc.identificacao && <span className="mr-3">ID: {doc.identificacao}</span>}
                            {doc.dataEmissao && <span className="mr-3">Emissão: {new Date(doc.dataEmissao.seconds ? doc.dataEmissao.seconds * 1000 : doc.dataEmissao).toLocaleDateString("pt-BR")}</span>}
                            {doc.dataVencimento && <span>Vencimento: {new Date(doc.dataVencimento.seconds ? doc.dataVencimento.seconds * 1000 : doc.dataVencimento).toLocaleDateString("pt-BR")}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => window.open(doc.arquivo?.url)}
                            title="Visualizar documento"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:text-red-600"
                            onClick={() => onDelete(doc.id)}
                            title="Deletar documento"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🖱️ [GERAL CARD DEBUG] Clique detectado em:', doc.nome);
                                onToggleEdit();
                            }}
                            className={`h-9 w-9 ml-2 transition-all ${isEditing ? 'bg-primary text-white hover:bg-primary/90 shadow-sm' : 'hover:bg-accent'}`}
                            title={isEditing ? "Cancelar edição" : "Editar detalhes"}
                        >
                            {isEditing ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <Pencil className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="p-6 bg-accent/5 border-t">
                    <form onSubmit={onUpload}>
                        <input type="hidden" name="nome" value={doc.nome} />
                        <input type="hidden" name="categoria" value={doc.categoria || "Outros Documentos"} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Identificação</Label>
                                <Input
                                    name="identificacao"
                                    placeholder="Ex: Ref 2024"
                                    defaultValue={doc.identificacao || ""}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Emissão</Label>
                                <Input
                                    name="dataEmissao"
                                    type="date"
                                    defaultValue={doc.dataEmissao ? formatarDataInput(doc.dataEmissao) : ""}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Vencimento</Label>
                                <Input
                                    name="dataVencimento"
                                    type="date"
                                    defaultValue={doc.dataVencimento ? formatarDataInput(doc.dataVencimento) : ""}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="mb-4 p-4 border border-dashed rounded-lg bg-blue-50/50">
                            <Label className="text-sm font-medium mb-2 block">
                                {isAttached ? "Substituir arquivo (opcional)" : "Anexar arquivo (PDF) *"}
                            </Label>
                            <Input
                                name="arquivo"
                                type="file"
                                accept=".pdf"
                                className="bg-white"
                                required={!isAttached}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={onToggleEdit}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={uploading}>
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                )}
                                {isAttached ? "Atualizar Dados" : "Salvar Documento"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
