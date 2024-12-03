export interface ApplicationDefinition {
    id: string;
    version: number;
}

export interface File {
    name: string;
    size: number;
    crc32: string;
    sha256: string;
}

export interface SenderDocument {
    file: File;
    senderEmail: string;
    recipientEmail: string;
}

export interface Fields {
    transactionId: string;
    senderDocument: SenderDocument;
}

export interface Transaction {
    id: string;
    application: ApplicationDefinition;
    field: Fields;
    filename: string;
    path: string;
    originalName: string;
    recordId: string;
    mailSent: boolean;
    senderEmail: string;
    recipientEmail: string;
    flowId?: string;
}
