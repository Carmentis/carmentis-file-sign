import { Injectable } from '@nestjs/common';

export interface Fields {
    transactionId: string;
    senderDocument: {
        file: {
            name: string;
            size: number;
            crc32: string;
            sha256: string;
        };
        senderEmail: string;
        recipientEmail: string;
    };
}

export interface PrepareUserApprovalData {
    application: string;
    version: number;
    fields: Fields;
    actors: {
        name: string;
    }[];
    channels: string[];
    subscriptions: {
        sender: string[];
        recipient: string[];
    };
    permissions: {
        mainChannel: string[];
        senderChannel: string[];
        recipientChannel: string[];
    };
    approval: {
        actor: string;
        message: string;
    };
}

export interface Transaction {
    application: {
        id: string;
        version: number;
    };
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

const globalItems: Map<string, Transaction> = new Map();

@Injectable()
export class FileSubmissionService {
    private readonly transactions: Map<string, Transaction>;

    constructor() {
        this.transactions = globalItems;
    }


    public addTransaction(transactionId: string, transaction: Transaction) {
        this.transactions.set(transactionId, transaction);
    }

    public getTransaction(recordId: string): Transaction {
        if (this.transactions.has(recordId)) {
            return this.transactions.get(recordId);
        } else {
            throw new Error('Transaction not found');
        }
    }
}
