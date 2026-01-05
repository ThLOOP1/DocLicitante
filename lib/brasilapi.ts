/**
 * BrasilAPI Integration
 * Utility functions for fetching company data from BrasilAPI
 */

/**
 * Response structure from BrasilAPI CNPJ endpoint
 */
export interface BrasilAPICNPJResponse {
    cnpj: string;
    identificador_matriz_filial: number;
    descricao_matriz_filial: string;
    razao_social: string;
    nome_fantasia: string;
    situacao_cadastral: string;
    descricao_situacao_cadastral: string;
    data_situacao_cadastral: string;
    motivo_situacao_cadastral: number;
    nome_cidade_exterior: string | null;
    codigo_natureza_juridica: number;
    data_inicio_atividade: string;
    cnae_fiscal: number;
    cnae_fiscal_descricao: string;
    descricao_tipo_logradouro: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    uf: string;
    codigo_municipio: number;
    municipio: string;
    ddd_telefone_1: string;
    ddd_telefone_2: string;
    ddd_fax: string;
    qualificacao_do_responsavel: number;
    capital_social: number;
    porte: string;
    descricao_porte: string;
    opcao_pelo_simples: boolean;
    data_opcao_pelo_simples: string | null;
    data_exclusao_do_simples: string | null;
    opcao_pelo_mei: boolean;
    situacao_especial: string;
    data_situacao_especial: string | null;
    cnaes_secundarios: Array<{
        codigo: number;
        descricao: string;
    }>;
    qsa: Array<{
        identificador_de_socio: number;
        nome_socio: string;
        cnpj_cpf_do_socio: string;
        codigo_qualificacao_socio: number;
        percentual_capital_social: number;
        data_entrada_sociedade: string;
        cpf_representante_legal: string | null;
        nome_representante_legal: string | null;
        codigo_qualificacao_representante_legal: number | null;
    }>;
}

/**
 * Structured company data for our application
 */
export interface EmpresaData {
    identificacao: {
        razaoSocial: string;
        nomeFantasia: string;
        cnpj: string;
        segmento: string;
        cidadeSede: string;
        dataInicioAtividade: string;
    };
    atividadesEconomicas: {
        principal: {
            codigo: string;
            descricao: string;
        };
        secundarias: Array<{
            codigo: string;
            descricao: string;
        }>;
    };
    endereco: {
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cep: string;
        municipio: string;
        uf: string;
    };
    contatoStatus: {
        email: string;
        telefone1: string;
        telefone2: string;
        situacaoCadastral: string;
        dataSituacaoCadastral: string;
    };
}

/**
 * Custom error class for BrasilAPI errors
 */
export class BrasilAPIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public originalError?: any
    ) {
        super(message);
        this.name = 'BrasilAPIError';
    }
}

/**
 * Validates and formats CNPJ
 * @param cnpj - CNPJ string with or without formatting
 * @returns Cleaned CNPJ with only digits
 * @throws BrasilAPIError if CNPJ is invalid
 */
export function validarFormatarCNPJ(cnpj: string): string {
    // Remove all non-digit characters
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Validate length
    if (cnpjLimpo.length !== 14) {
        throw new BrasilAPIError('CNPJ deve conter exatamente 14 dígitos');
    }

    // Validate if all digits are the same (invalid CNPJ)
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
        throw new BrasilAPIError('CNPJ inválido');
    }

    return cnpjLimpo;
}

/**
 * Formats CNPJ code with proper separators
 * @param codigo - CNAE code as number or string
 * @returns Formatted CNAE code (e.g., "4712-1/00")
 */
function formatarCodigoCNAE(codigo: number | string): string {
    const codigoStr = String(codigo).padStart(7, '0');
    return `${codigoStr.slice(0, 4)}-${codigoStr.slice(4, 5)}/${codigoStr.slice(5)}`;
}

/**
 * Fetches company data from BrasilAPI
 * @param cnpj - CNPJ string (with or without formatting)
 * @returns Structured company data
 * @throws BrasilAPIError on validation or API errors
 */
export async function buscarDadosCNPJ(cnpj: string): Promise<EmpresaData> {
    // Validate and clean CNPJ
    const cnpjLimpo = validarFormatarCNPJ(cnpj);

    try {
        // Make request to BrasilAPI
        const response = await fetch(
            `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                // Add timeout
                signal: AbortSignal.timeout(10000), // 10 seconds
            }
        );

        // Handle HTTP errors
        if (!response.ok) {
            if (response.status === 404) {
                throw new BrasilAPIError('CNPJ não encontrado na base de dados da Receita Federal', 404);
            }
            if (response.status === 429) {
                throw new BrasilAPIError('Muitas requisições. Aguarde alguns segundos e tente novamente', 429);
            }
            if (response.status >= 500) {
                throw new BrasilAPIError('Serviço temporariamente indisponível. Tente novamente em alguns minutos', response.status);
            }
            throw new BrasilAPIError(`Erro ao buscar dados: ${response.statusText}`, response.status);
        }

        // Parse response
        const data: BrasilAPICNPJResponse = await response.json();

        // Map to our application structure
        const empresaData: EmpresaData = {
            identificacao: {
                razaoSocial: data.razao_social || '',
                nomeFantasia: data.nome_fantasia || '',
                cnpj: data.cnpj,
                segmento: data.cnae_fiscal_descricao || '',
                cidadeSede: data.municipio || '',
                dataInicioAtividade: data.data_inicio_atividade || '',
            },
            atividadesEconomicas: {
                principal: {
                    codigo: formatarCodigoCNAE(data.cnae_fiscal),
                    descricao: data.cnae_fiscal_descricao || '',
                },
                secundarias: (data.cnaes_secundarios || []).map(cnae => ({
                    codigo: formatarCodigoCNAE(cnae.codigo),
                    descricao: cnae.descricao,
                })),
            },
            endereco: {
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                cep: data.cep || '',
                municipio: data.municipio || '',
                uf: data.uf || '',
            },
            contatoStatus: {
                email: '', // BrasilAPI não retorna email
                telefone1: data.ddd_telefone_1 || '',
                telefone2: data.ddd_telefone_2 || '',
                situacaoCadastral: data.descricao_situacao_cadastral || data.situacao_cadastral || '',
                dataSituacaoCadastral: data.data_situacao_cadastral || '',
            },
        };

        return empresaData;

    } catch (error: any) {
        // Handle network errors
        if (error.name === 'AbortError') {
            throw new BrasilAPIError('Tempo limite excedido. Verifique sua conexão e tente novamente');
        }

        if (error instanceof BrasilAPIError) {
            throw error;
        }

        // Handle other errors
        throw new BrasilAPIError(
            'Erro ao buscar dados do CNPJ. Verifique sua conexão e tente novamente',
            undefined,
            error
        );
    }
}

/**
 * Formats CNPJ for display (XX.XXX.XXX/XXXX-XX)
 * @param cnpj - CNPJ string with only digits
 * @returns Formatted CNPJ
 */
export function formatarCNPJParaExibicao(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return cnpj;

    return cnpjLimpo.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
    );
}
