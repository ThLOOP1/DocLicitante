import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

interface UseDocumentosProps {
    empresaId: string
}

export function useDocumentos({ empresaId }: UseDocumentosProps) {
    const [certidoes, setCertidoes] = useState<any[]>([])
    const [docsGerais, setDocsGerais] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [allCategories, setAllCategories] = useState<string[]>([
        'Habilitação Jurídica',
        'Regularidade Fiscal/Trabalhista',
        'Qualificação Técnica',
        'Qualificação Econômico-Financeira',
        'Documentação Societária',
        'Outros Documentos'
    ])

    const fetchDocumentos = useCallback(async () => {
        if (!empresaId) return

        try {
            // 1. Buscar todos os documentos anexados do Firestore
            const response = await fetch(`/api/empresas/${empresaId}/documentos`)
            const allUploadedDocs = response.ok ? await response.json() : []

            const certsUploaded = allUploadedDocs.filter((d: any) => d.tipo === 'certidao')
            const geraisUploaded = allUploadedDocs.filter((d: any) => d.tipo === 'geral')

            // 2. Buscar documentos customizados (templates criados pelo usuário)
            const customDocsResponse = await fetch(`/api/empresas/${empresaId}/custom-docs`)
            const customTemplates = customDocsResponse.ok ? await customDocsResponse.json() : []

            // 3. Buscar categorias (com fallback para 404)
            try {
                const categoriesResponse = await fetch(`/api/empresas/${empresaId}/categorias`)
                if (categoriesResponse.ok) {
                    const catData = await categoriesResponse.json()
                    setAllCategories(catData.todas)
                }
            } catch (catError) {
                console.warn("⚠️ [useDocumentos] Usando categorias padrão (API falhou ou 404)")
            }

            // 4. Lógica de Merge Inteligente
            // Criar mapa de anexados por nome para priorização
            const anexadosPorNome = new Map<string, any>()
            certsUploaded.forEach((doc: any) => {
                anexadosPorNome.set(doc.nome, doc)
            })

            // Processar templates customizados
            const processedCustomDocs = customTemplates.map((tpl: any) => {
                const anexado = anexadosPorNome.get(tpl.nome)
                if (anexado) {
                    // KEY: Mantemos o ID do placeholder para estabilidade do React
                    return { ...anexado, id: tpl.id, realFileId: anexado.id, placeholder: false }
                }
                return { ...tpl, placeholder: true }
            })

            // Identificar anexados que não são templates
            const templateNames = new Set(customTemplates.map((t: any) => t.name || t.nome))
            const orphanDocs = certsUploaded.filter((uploaded: any) => !templateNames.has(uploaded.nome))

            // Combinar e calcular datas
            const allCertidoes = [...processedCustomDocs, ...orphanDocs]

            const uniqueCerts = Array.from(
                allCertidoes.reduce((map, doc) => {
                    const existing = map.get(doc.nome)
                    if (!existing || (!doc.placeholder && existing.placeholder)) {
                        map.set(doc.nome, doc)
                    }
                    return map
                }, new Map()).values()
            ).map((cert: any) => {
                if (cert.placeholder || !cert.dataVencimento) return { ...cert, diasAVencer: null }

                const hoje = new Date()
                hoje.setHours(0, 0, 0, 0)
                const vencimento = cert.dataVencimento.toDate ? cert.dataVencimento.toDate() : new Date(cert.dataVencimento)
                vencimento.setHours(0, 0, 0, 0)

                const diffTime = vencimento.getTime() - hoje.getTime()
                const diasAVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return { ...cert, diasAVencer }
            })

            setCertidoes(uniqueCerts)
            setDocsGerais(geraisUploaded)
        } catch (error) {
            console.error("Erro ao buscar documentos:", error)
            toast.error("Erro ao carregar documentos")
        } finally {
            setLoading(false)
        }
    }, [empresaId])

    const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>, tipo: 'certidao' | 'geral', onFinish?: () => void) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const file = formData.get('arquivo') as File
        const isPlaceholder = formData.get('isPlaceholder') === 'true'

        if (isPlaceholder && (!file || file.size === 0)) {
            toast.error("Por favor, selecione um arquivo.")
            return
        }

        setUploading(true)
        try {
            formData.append('tipo', tipo)
            const response = await fetch(`/api/empresas/${empresaId}/documentos`, {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                toast.success("Documento enviado com sucesso!")
                await fetchDocumentos()
                if (onFinish) onFinish()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao enviar documento")
            }
        } catch (error) {
            toast.error("Erro de conexão com o servidor")
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteDocumento = async (docId: string) => {
        if (!confirm("Tem certeza que deseja excluir este documento?")) return
        try {
            const response = await fetch(`/api/documentos/${docId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                toast.success("Documento excluído com sucesso!")
                await fetchDocumentos()
            }
        } catch (error) {
            toast.error("Erro ao excluir documento")
        }
    }

    useEffect(() => {
        fetchDocumentos()
    }, [fetchDocumentos])

    return {
        certidoes,
        docsGerais,
        loading,
        uploading,
        allCategories,
        fetchDocumentos,
        handleFileUpload,
        handleDeleteDocumento
    }
}
