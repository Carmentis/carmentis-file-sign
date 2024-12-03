import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TransactionEntry {
    @PrimaryColumn()
    transactionId: string;

    @Column()
    serializedTransaction: string;
}
