import { CertificadoCard } from "./CertificadoCard"

interface DocumentGridProps {
    documentos: any[]
    editingId: string | null
    uploading: boolean
    onToggleEdit: (id: string) => void
    onDelete: (id: string) => void
    onUpload: (e: React.FormEvent<HTMLFormElement>) => void
    emptyMessage?: string
}

export function DocumentGrid({
    documentos,
    editingId,
    uploading,
    onToggleEdit,
    onDelete,
    onUpload,
    emptyMessage = "Nenhum documento encontrado."
}: DocumentGridProps) {
    if (!Array.isArray(documentos) || documentos.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-accent/5">
                <p className="text-muted-foreground italic font-medium">{emptyMessage}</p>
            </div>
        )
    }

    const getStableId = (doc: any) => doc.id || doc.nome

    return (
        <div className="grid grid-cols-1 gap-3">
            {documentos.map(doc => {
                const stableId = getStableId(doc)
                return (
                    <CertificadoCard
                        key={stableId}
                        certidao={doc}
                        isEditing={editingId === stableId}
                        onToggleEdit={() => onToggleEdit(stableId)}
                        onDelete={onDelete}
                        onUpload={onUpload}
                        uploading={uploading}
                    />
                )
            })}
        </div>
    )
}
