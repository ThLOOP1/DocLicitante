/**
 * Tipos TypeScript para entidades de Empresa
 */

/**
 * Código Nacional de Atividade Econômica
 */
export interface CNAE {
    codigo: string;
    descricao: string;
}

/**
 * Endereço completo
 */
export interface Endereco {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

/**
 * Informações de contato
 */
export interface Contato {
    email: string;
    telefone: string;
}

/**
 * Informações do Cartão CNPJ (arquivo)
 */
export interface CartaoCNPJ {
    nome: string;
    url: string;
    fileId: string;
    tamanho: number;
    uploadedAt: Date | string;
}

/**
 * Empresa completa
 */
export interface Empresa {
    id: string;
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    donoUid: string;
    segmento: string;
    cidadeSede: string;
    cnaePrincipal: CNAE;
    endereco: Endereco;
    contato: Contato;
    situacaoCadastral: string;
    dataSituacaoCadastral: Date | string;
    cnaesSecundarios: CNAE[];
    status: 'ativo' | 'inativo';
    cartaoCNPJ?: CartaoCNPJ;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Dados para criação de nova empresa
 */
export interface NovaEmpresa {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    donoUid: string;
    segmento: string;
    cidadeSede: string;
    cnaePrincipal: CNAE;
    endereco: Endereco;
    contato: Contato;
    situacaoCadastral?: string;
    dataSituacaoCadastral?: Date | string;
    cnaesSecundarios?: CNAE[];
}
