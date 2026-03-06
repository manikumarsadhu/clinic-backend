import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn( {name: 'updated_at', default: () => 'CURRENT_TIMESTAMP'} )
    updatedAt: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}