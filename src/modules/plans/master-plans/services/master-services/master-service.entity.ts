import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PlanCategory } from '../../plan-categories/plan-category.entity';


@Entity('master_services')
export class MasterService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ unique: true })
    name: string;

    // Foreign Key Column
    @Column('uuid', { nullable: true })
    category_id: string | null;

    // Relation
    @ManyToOne(() => PlanCategory, (category) => category.services, {
        eager: true,
    })
    @JoinColumn({ name: 'category_id' })
    category: PlanCategory;

    @Column('decimal')
    standard_price: number;

    @Column('decimal', { nullable: true })
    special_offer_price: number;

    @Column({ default: false })
    is_free_allowed: boolean;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    is_active: boolean;

    @Column('uuid')
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}