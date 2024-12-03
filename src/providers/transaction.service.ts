import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction';
import { TransactionEntry } from '../entities/transactionEntry';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(TransactionEntry)
        private readonly transactionRepository: Repository<TransactionEntry>,
    ) {}

    // Add a new transaction
    async addTransaction(transaction: Transaction): Promise<void> {
        await this.transactionRepository.save({
            transactionId: transaction.recordId,
            serializedTransaction: JSON.stringify(transaction),
        });
    }

    // Get a transaction by ID
    async getTransaction(transactionId: string): Promise<Transaction> {
        const transactionEntry: TransactionEntry =
            await this.transactionRepository.findOneBy({
                transactionId,
            });
        if (!transactionEntry) {
            throw new NotFoundException(
                `Transaction with id ${transactionId} not found`,
            );
        }
        return JSON.parse(transactionEntry.serializedTransaction);
    }

    // Update a transaction
    async updateTransaction(transaction: Transaction): Promise<void> {
        await this.transactionRepository.save({
            transactionId: transaction.recordId,
            serializedTransaction: JSON.stringify(transaction),
        });
    }

    // Remove a transaction by ID
    async removeTransaction(transactionId: string) {
        await this.transactionRepository.delete({ transactionId });
    }
}
