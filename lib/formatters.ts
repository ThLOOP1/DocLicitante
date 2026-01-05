/**
 * Utilitários de formatação de dados para o DocLicitante
 */

/**
 * Formata data para exibição no padrão brasileiro (DD/MM/AAAA)
 * @param data - Data do Firestore Timestamp, Date ou string
 * @returns String formatada ou '-' se data inválida
 */
export function formatarDataBR(data: Date | string | any): string {
    if (!data) return '-'

    try {
        // Converte Firestore Timestamp para Date
        let d: Date;

        if (data.toDate) {
            // Firestore Timestamp com método toDate()
            d = data.toDate()
        } else if (data._seconds) {
            // Firestore Timestamp serializado com _seconds
            d = new Date(data._seconds * 1000)
        } else {
            // String ou Date normal
            d = new Date(data)
        }

        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    } catch (error) {
        console.error('Erro ao formatar data:', error)
        return '-'
    }
}

/**
 * Formata data para input type="date" (YYYY-MM-DD)
 * @param data - Data do Firestore Timestamp, Date ou string
 * @returns String no formato YYYY-MM-DD
 */
export function formatarDataInput(data: Date | string | any): string {
    if (!data) return ''

    try {
        let d: Date;

        if (data.toDate) {
            d = data.toDate()
        } else if (data._seconds) {
            d = new Date(data._seconds * 1000)
        } else {
            d = new Date(data)
        }

        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    } catch (error) {
        return ''
    }
}

/**
 * Calcula quantos dias faltam até a data de vencimento
 * @param dataVencimento - Data de vencimento
 * @returns Número de dias (negativo se vencido)
 */
export function calcularDiasRestantes(dataVencimento: Date | string | any): number | null {
    if (!dataVencimento) return null

    try {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        // Converter Firestore Timestamp para Date
        let vencimento: Date;

        if (dataVencimento.toDate) {
            // Firestore Timestamp com método toDate()
            vencimento = dataVencimento.toDate()
        } else if (dataVencimento._seconds) {
            // Firestore Timestamp serializado com _seconds
            vencimento = new Date(dataVencimento._seconds * 1000)
        } else if (typeof dataVencimento === 'string' || dataVencimento instanceof Date) {
            // String ou Date normal
            vencimento = new Date(dataVencimento)
        } else {
            return null
        }

        vencimento.setHours(0, 0, 0, 0)

        const diffTime = vencimento.getTime() - hoje.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return diffDays
    } catch (error) {
        console.error('Erro ao calcular dias restantes:', error)
        return null
    }
}

/**
 * Calcula status e informações de exibição baseado nos dias restantes
 * @param dataVencimento - Data de vencimento
 * @returns Objeto com texto, cor e badge para exibição
 */
export function calcularStatusDocumento(dataVencimento: Date | string | any) {
    const diasRestantes = calcularDiasRestantes(dataVencimento)

    if (diasRestantes === null) {
        return {
            texto: 'Sem vencimento',
            cor: 'text-muted-foreground',
            badge: 'Pendente',
            badgeVariant: 'secondary' as const,
            diasRestantes: null
        }
    }

    if (diasRestantes < 0) {
        return {
            texto: `Vencido há ${Math.abs(diasRestantes)} ${Math.abs(diasRestantes) === 1 ? 'dia' : 'dias'}`,
            cor: 'text-red-600',
            badge: 'Vencido',
            badgeVariant: 'destructive' as const,
            diasRestantes
        }
    } else if (diasRestantes === 0) {
        return {
            texto: 'Vence hoje',
            cor: 'text-red-600',
            badge: 'Vence Hoje',
            badgeVariant: 'destructive' as const,
            diasRestantes
        }
    } else if (diasRestantes <= 15) {
        return {
            texto: `Faltam ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
            cor: 'text-yellow-600',
            badge: 'Atenção',
            badgeVariant: 'warning' as const,
            diasRestantes
        }
    } else {
        return {
            texto: `Válido por ${diasRestantes} dias`,
            cor: 'text-green-600',
            badge: 'Válido',
            badgeVariant: 'success' as const,
            diasRestantes
        }
    }
}

/**
 * Formata número de bytes para tamanho legível
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatarTamanhoArquivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
