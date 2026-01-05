/**
 * Funções de formatação e máscaras para dados brasileiros
 */

/**
 * Formata CNPJ para o padrão brasileiro
 * @param cnpj - CNPJ sem formatação (apenas números)
 * @returns CNPJ formatado (00.000.000/0000-00)
 * @example formatCNPJ('21498772000175') // '21.498.772/0001-75'
 */
export function formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
    );
}

/**
 * Formata CPF para o padrão brasileiro
 * @param cpf - CPF sem formatação (apenas números)
 * @returns CPF formatado (000.000.000-00)
 * @example formatCPF('12345678900') // '123.456.789-00'
 */
export function formatCPF(cpf: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        '$1.$2.$3-$4'
    );
}

/**
 * Formata CEP para o padrão brasileiro
 * @param cep - CEP sem formatação (apenas números)
 * @returns CEP formatado (00000-000)
 * @example formatCEP('01310100') // '01310-100'
 */
export function formatCEP(cep: string): string {
    if (!cep) return '';
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return cep;
    return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

/**
 * Formata telefone para o padrão brasileiro
 * @param phone - Telefone sem formatação (apenas números)
 * @returns Telefone formatado ((00) 00000-0000 ou (00) 0000-0000)
 * @example formatPhone('11987654321') // '(11) 98765-4321'
 */
export function formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');

    // Celular (11 dígitos)
    if (cleaned.length === 11) {
        return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }

    // Fixo (10 dígitos)
    if (cleaned.length === 10) {
        return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }

    return phone;
}

/**
 * Formata data para o padrão brasileiro
 * @param date - Data como Date, string ou Timestamp do Firestore
 * @returns Data formatada (DD/MM/YYYY)
 */
export function formatDate(date: any): string {
    if (!date) return '';

    try {
        // Se for Timestamp do Firestore
        if (date.toDate && typeof date.toDate === 'function') {
            return date.toDate().toLocaleDateString('pt-BR');
        }

        // Se for string ou Date
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return String(date);
    }
}

/**
 * Formata data e hora para o padrão brasileiro
 * @param date - Data como Date, string ou Timestamp do Firestore
 * @returns Data e hora formatadas (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: any): string {
    if (!date) return '';

    try {
        // Se for Timestamp do Firestore
        if (date.toDate && typeof date.toDate === 'function') {
            return date.toDate().toLocaleString('pt-BR');
        }

        // Se for string ou Date
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data/hora:', error);
        return String(date);
    }
}

/**
 * Remove máscara de um valor, deixando apenas números
 * @param value - Valor com máscara
 * @returns Valor sem máscara (apenas números)
 */
export function removeMask(value: string): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
}
