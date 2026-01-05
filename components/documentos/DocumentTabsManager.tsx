import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DocumentGrid } from "./DocumentGrid"

interface DocumentTabsManagerProps {
    categories: string[]
    documentos: any[]
    docsGerais: any[]
    editingId: string | null
    uploading: boolean
    filtroAtivo: string
    onToggleEdit: (id: string) => void
    onDelete: (id: string) => void
    onUpload: (e: React.FormEvent<HTMLFormElement>) => void
}

export function DocumentTabsManager({
    categories,
    documentos,
    docsGerais,
    editingId,
    uploading,
    filtroAtivo,
    onToggleEdit,
    onDelete,
    onUpload
}: DocumentTabsManagerProps) {

    const formatTabId = (cat: string) =>
        cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return (
        <>
            <TabsList className="grid w-full grid-cols-2 lg:text-sm lg:flex lg:flex-wrap mb-8 h-auto gap-1 p-1 bg-muted/30">
                <TabsTrigger value="todos" className="py-2.5 text-xs lg:text-sm px-4">Todos</TabsTrigger>
                {categories.map(cat => (
                    <TabsTrigger key={cat} value={formatTabId(cat)} className="py-2.5 text-xs lg:text-sm px-4 text-center">
                        {cat.split('/')[0]}
                    </TabsTrigger>
                ))}
                <TabsTrigger value="gerais" className="py-2.5 text-xs lg:text-sm px-4">Documentos Gerais</TabsTrigger>
            </TabsList>

            <TabsContent value="todos">
                <div className="space-y-10">
                    {categories.map(cat => {
                        // Usar startsWith para permitir subcategorias (ex: "Regularidade Fiscal/Trabalhista")
                        const docsInCat = documentos.filter(d => d.categoria && d.categoria.startsWith(cat))
                        if (docsInCat.length === 0 && filtroAtivo === 'todos') return null

                        return (
                            <div key={cat} className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase border-l-4 border-primary pl-2 tracking-widest">{cat}</h3>
                                <DocumentGrid
                                    documentos={docsInCat}
                                    editingId={editingId}
                                    uploading={uploading}
                                    onToggleEdit={onToggleEdit}
                                    onDelete={onDelete}
                                    onUpload={onUpload}
                                    emptyMessage={`Nenhum documento nesta categoria com o filtro "${filtroAtivo}".`}
                                />
                            </div>
                        )
                    })}

                    {(filtroAtivo === 'todos' || filtroAtivo === 'vencidos') && docsGerais.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase border-l-4 border-slate-300 pl-2 tracking-widest">Documentos Gerais</h3>
                            <DocumentGrid
                                documentos={docsGerais}
                                editingId={editingId}
                                uploading={uploading}
                                onToggleEdit={onToggleEdit}
                                onDelete={onDelete}
                                onUpload={onUpload}
                            />
                        </div>
                    )}
                </div>
            </TabsContent>

            {categories.map(cat => (
                <TabsContent key={cat} value={formatTabId(cat)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{cat}</CardTitle>
                            <CardDescription>Visualização detalhada da categoria</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DocumentGrid
                                documentos={documentos.filter(d => d.categoria && d.categoria.startsWith(cat))}
                                editingId={editingId}
                                uploading={uploading}
                                onToggleEdit={onToggleEdit}
                                onDelete={onDelete}
                                onUpload={onUpload}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            ))}

            <TabsContent value="gerais">
                <Card>
                    <CardHeader>
                        <CardTitle>Documentos Gerais</CardTitle>
                        <CardDescription>Documentos diversos e extras da empresa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DocumentGrid
                            documentos={docsGerais}
                            editingId={editingId}
                            uploading={uploading}
                            onToggleEdit={onToggleEdit}
                            onDelete={onDelete}
                            onUpload={onUpload}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </>
    )
}
