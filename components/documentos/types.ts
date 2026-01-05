/**
 * Tipos compartilhados para os componentes de documentos
 * Single Responsibility: Centralizar todas as definições de tipos
 */

export interface Documento {
    id?: string
    nome: string
    identificacao?: string
    categoria?: string
    dataEmissao?: any
    dataVencimento?: any
    arquivo?: {
        url: string
        nome?: string
    }
    placeholder: boolean
    diasAVencer?: number | null
}

export interface StatusInfo {
    texto: string
    cor: string
    badge: string
    badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary'
    diasRestantes: number | null
}

export interface CardActionsProps {
    documento: Documento
    isEditing: boolean
    isAttached: boolean
    onToggleEdit: () => void
    onDelete: (id: string) => void
}

export interface CardHeaderProps {
    documento: Documento
    statusInfo: StatusInfo
    isAttached: boolean
}

export interface CardIndicatorsProps {
    documento: Documento
    statusInfo: StatusInfo
}

export interface CardUploadFormProps {
    documento: Documento
    isAttached: boolean
    uploading: boolean
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    onCancel: () => void
}

export interface CertificadoCardProps {
    certidao: Documento
    isEditing: boolean
    onToggleEdit: () => void
    onDelete: (id: string) => void
    onUpload: (e: React.FormEvent<HTMLFormElement>) => void
    uploading: boolean
}
