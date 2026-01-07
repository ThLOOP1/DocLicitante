import formidable, { File } from 'formidable';
import { NextRequest } from 'next/server';
import fs from 'fs/promises';

export interface ParsedForm {
    fields: formidable.Fields;
    files: formidable.Files;
}

/**
 * Helper para fazer parse de form-data em Next.js API Routes
 * Usa formidable para processar multipart/form-data
 */
export async function parseForm(request: NextRequest): Promise<ParsedForm> {
    // Converter NextRequest para Node.js IncomingMessage
    const formData = await request.formData();

    const fields: any = {};
    const files: any = {};

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            // É um arquivo
            const buffer = Buffer.from(await value.arrayBuffer());
            files[key] = {
                buffer,
                originalname: value.name,
                mimetype: value.type,
                size: value.size,
            };
        } else {
            // É um campo de texto
            fields[key] = value;
        }
    }

    return { fields, files };
}

/**
 * Helper para obter um único arquivo do form
 */
export function getSingleFile(files: any, fieldName: string): any | null {
    const file = files[fieldName];
    if (!file) return null;
    return file;
}
