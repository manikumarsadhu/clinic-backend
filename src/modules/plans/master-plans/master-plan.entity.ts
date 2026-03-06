import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';
import { PlanCategory } from './plan-categories/plan-category.entity';

export enum AgeGroup {
    KIDS = 'Kids',
    ADULTS = 'Adults',
    SENIOR = 'Senior',
}

export enum PlanType {
    YEARLY = 'Yearly',
}

export enum PlanPublishStatus {
    DRAFT = 'DRAFT',
    PUBLISH = 'PUBLISH',
}

@Entity('master_plans')
export class MasterPlan {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('uuid')
    category_id: string;

    @ManyToOne(() => PlanCategory)
    @JoinColumn({ name: 'category_id' })
    category: PlanCategory;

    @Index()
    @Column({
        type: 'enum',
        enum: AgeGroup,
    })
    age_group: AgeGroup;

    @Column({
        type: 'enum',
        enum: PlanType,
        default: PlanType.YEARLY,
    })
    plan_type: PlanType;

    @Column({ default: 365 })
    duration_in_days: number;

    @Column('decimal')
    base_price: number;

    @Column('decimal', { default: 0 })
    discount_percentage: number;

    @Column('decimal', { default: 0 })
    max_discount_allowed: number;

    @Column({ nullable: true })
    logo_url: string;

    @Column('simple-array', { nullable: true })
    media: string[];

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: false })
    is_upgradeable: boolean;

    @Column({ default: 1 })
    version: number;

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

    @Column({
        type: 'enum',
        enum: PlanPublishStatus,
        default: PlanPublishStatus.DRAFT,
    })
    status: PlanPublishStatus;
}
