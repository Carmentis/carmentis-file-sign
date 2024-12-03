import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('transaction_entry')
export class TransactionEntry {
    @PrimaryColumn()
    transactionId: string;

    @Column()
    serializedTransaction: string;
}
