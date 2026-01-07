/**
 * Helper para converter Timestamps do Firestore em Dates
 * Migrado de server/index.js
 */
export function convertTimestamps(data: any): any {
    if (!data) return data;

    return {
        ...data,
        dataSituacaoCadastral: data.dataSituacaoCadastral?.toDate?.() || data.dataSituacaoCadastral,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        // Converter também timestamps aninhados se existirem
        cartaoCNPJ: data.cartaoCNPJ
            ? {
                ...data.cartaoCNPJ,
                uploadedAt: data.cartaoCNPJ.uploadedAt?.toDate?.() || data.cartaoCNPJ.uploadedAt,
            }
            : undefined,
    };
}
