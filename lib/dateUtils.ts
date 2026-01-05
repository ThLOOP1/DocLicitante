/**
 * Utilitários de data para o frontend
 */

/**
 * Calcula quantos dias faltam até a data de vencimento
 */
export function calcularDiasAVencer(dataVencimento: Date | string): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calcula o status baseado nos dias até vencer
 */
export function calcularStatus(diasAVencer: number): 'vencido' | 'vencendo' | 'valido' {
    if (diasAVencer < 0) return 'vencido';
    if (diasAVencer <= 15) return 'vencendo';
    return 'valido';
}

/**
 * Calcula dias e status automaticamente
 */
export function calcularStatusCertidao(dataVencimento: Date | string) {
    const diasAVencer = calcularDiasAVencer(dataVencimento);
    const status = calcularStatus(diasAVencer);
    return { diasAVencer, status };
}

/**
 * Formata data para exibição
 */
export function formatarData(data: Date | string): string {
    return new Date(data).toLocaleDateString('pt-BR');
}

/**
 * Formata data para input type="date"
 */
export function formatarDataInput(data: Date | string): string {
    const d = new Date(data);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
