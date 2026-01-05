"use client"

import { Loader2, Upload, FileCheck, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatarDataInput } from "@/lib/formatters"
import type { CardUploadFormProps } from "./types"

/**
 * CardUploadForm - Formulário de Upload/Edição
 * Single Responsibility: Gerenciar o formulário de anexo e atualização de documentos
 */
export function CardUploadForm({
    documento,
    isAttached,
    uploading,
    onSubmit,
    onCancel,
}: CardUploadFormProps) {
    return (
        <div className="p-6 bg-accent/5 border-t">
            <form onSubmit={onSubmit}>
                {/* Campos hidden para manter os dados */}
                <input type="hidden" name="nome" value={documento.nome} />
                <input type="hidden" name="categoria" value={documento.categoria || ""} />
                <input type="hidden" name="isPlaceholder" value={documento.placeholder ? "true" : "false"} />

                {/* Campos de dados - Editáveis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Identificação */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Identificação</Label>
                        <Input
                            name="identificacao"
                            placeholder="Ex: 204"
                            defaultValue={documento.identificacao || ""}
                            required
                            className="bg-white"
                        />
                    </div>

                    {/* Data de Emissão */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Emissão *</Label>
                        <Input
                            name="dataEmissao"
                            type="date"
                            defaultValue={
                                documento.dataEmissao
                                    ? formatarDataInput(documento.dataEmissao)
                                    : ""
                            }
                            required
                            className="bg-white"
                        />
                    </div>

                    {/* Data de Vencimento */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Vencimento *</Label>
                        <Input
                            name="dataVencimento"
                            type="date"
                            defaultValue={
                                documento.dataVencimento
                                    ? formatarDataInput(documento.dataVencimento)
                                    : ""
                            }
                            required
                            className="bg-white"
                        />
                    </div>
                </div>

                {/* Campo de arquivo com botões ao lado */}
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-4">
                    <div className="w-full md:w-1/2 space-y-2">
                        <Label className="text-sm font-medium">
                            {isAttached ? "Arquivo Atual" : "Arquivo (PDF) *"}
                        </Label>
                        {isAttached ? (
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                                <FileCheck className="h-4 w-4 text-primary" />
                                <span className="text-sm truncate flex-1">
                                    {documento.arquivo?.nome || documento.nome + '.pdf'}
                                </span>
                            </div>
                        ) : (
                            <Input
                                name="arquivo"
                                type="file"
                                accept=".pdf"
                                required={documento.placeholder}
                                className="bg-white"
                            />
                        )}
                    </div>

                    {/* Botões de ação - Modo substituição (apenas se anexado) */}
                    {isAttached && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (documento.arquivo?.url) {
                                        window.open(documento.arquivo.url)
                                    }
                                }}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Baixar
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (confirm("Tem certeza que deseja deletar este documento?")) {
                                        // Este botão será removido pois já temos o botão deletar fora
                                        // Mantido aqui por compatibilidade
                                    }
                                }}
                                className="gap-2 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Deletar
                            </Button>
                        </div>
                    )}
                </div>

                {/* Área de substituição - Só aparece quando anexado */}
                {isAttached && (
                    <div className="mb-4 p-4 border border-dashed rounded-lg bg-blue-50/50">
                        <Label className="text-sm font-medium mb-2 block">
                            Substituir por novo arquivo
                        </Label>
                        <Input
                            name="arquivo"
                            type="file"
                            accept=".pdf"
                            className="bg-white"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Selecione um novo arquivo para substituir o documento atual
                        </p>
                    </div>
                )}

                {/* Botões de submit e cancelar */}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : isAttached ? (
                            <Upload className="h-4 w-4 mr-2" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {isAttached ? "Atualizar" : "Salvar e Anexar"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
