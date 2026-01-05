/**
 * Utilitários para cálculos de data e validação de certidões
 */

/**
 * Calcula quantos dias faltam até a data de vencimento
 * @param dataValidade - Data de validade da certidão
 * @returns Número de dias (negativo se já venceu)
 */
function calcularDiasAVencer(dataValidade) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa

    const vencimento = new Date(dataValidade);
    vencimento.setHours(0, 0, 0, 0);

    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calcula o status baseado nos dias até vencer
 * @param diasAVencer - Número de dias até vencer
 * @returns Status: 'vencido', 'vencendo' ou 'valido'
 */
function calcularStatus(diasAVencer) {
    if (diasAVencer < 0) return 'vencido';
    if (diasAVencer <= 15) return 'vencendo';
    return 'valido';
}

/**
 * Calcula dias e status automaticamente
 * @param dataValidade - Data de validade
 * @returns Objeto com diasAVencer e status
 */
function calcularStatusCertidao(dataValidade) {
    const diasAVencer = calcularDiasAVencer(dataValidade);
    const status = calcularStatus(diasAVencer);
    return { diasAVencer, status };
}

module.exports = {
    calcularDiasAVencer,
    calcularStatus,
    calcularStatusCertidao
};
