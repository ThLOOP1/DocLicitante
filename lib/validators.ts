/**
 * Funções de validação para o frontend
 */

/**
 * Valida CNPJ
 */
export function validarCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '');

    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != parseInt(digitos.charAt(1))) return false;

    return true;
}

/**
 * Valida campos obrigatórios de uma certidão
 */
export function validarCamposObrigatoriosCertidao(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nome || data.nome.trim() === '') {
        errors.push('Nome da certidão é obrigatório');
    }

    if (!data.categoria || data.categoria.trim() === '') {
        errors.push('Categoria é obrigatória');
    }

    if (!data.dataEmissao) {
        errors.push('Data de emissão é obrigatória');
    }

    if (!data.dataVencimento) {
        errors.push('Data de vencimento é obrigatória');
    }

    if (data.dataEmissao && data.dataVencimento) {
        const emissao = new Date(data.dataEmissao);
        const validade = new Date(data.dataVencimento);

        if (validade <= emissao) {
            errors.push('Data de vencimento deve ser posterior à data de emissão');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Formata CNPJ
 */
export function formatarCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
