/**
 * Funções de validação para o sistema
 */

/**
 * Valida CNPJ
 * @param cnpj - CNPJ a ser validado (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
function validarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Validação dos dígitos verificadores
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
}

/**
 * Valida campos obrigatórios de uma certidão
 * @param data - Dados da certidão
 * @returns Objeto com valid (boolean) e errors (array de strings)
 */
function validarCamposObrigatoriosCertidao(data) {
    const errors = [];

    if (!data.nome || data.nome.trim() === '') {
        errors.push('Nome da certidão é obrigatório');
    }

    if (!data.categoria || data.categoria.trim() === '') {
        errors.push('Categoria é obrigatória');
    }

    if (!data.dataEmissao) {
        errors.push('Data de emissão é obrigatória');
    }

    if (!data.dataValidade) {
        errors.push('Data de validade é obrigatória');
    }

    // Validar que a data de validade é posterior à emissão
    if (data.dataEmissao && data.dataValidade) {
        const emissao = new Date(data.dataEmissao);
        const validade = new Date(data.dataValidade);

        if (validade <= emissao) {
            errors.push('Data de validade deve ser posterior à data de emissão');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida campos obrigatórios de uma empresa
 * @param data - Dados da empresa
 * @returns Objeto com valid (boolean) e errors (array de strings)
 */
function validarCamposObrigatoriosEmpresa(data) {
    const errors = [];

    if (!data.nome || data.nome.trim() === '') {
        errors.push('Nome/Razão Social é obrigatório');
    }

    if (!data.cnpj || data.cnpj.trim() === '') {
        errors.push('CNPJ é obrigatório');
    } else if (!validarCNPJ(data.cnpj)) {
        errors.push('CNPJ inválido');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validarCNPJ,
    validarCamposObrigatoriosCertidao,
    validarCamposObrigatoriosEmpresa
};
