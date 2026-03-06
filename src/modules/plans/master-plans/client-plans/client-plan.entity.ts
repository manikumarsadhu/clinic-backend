import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { MasterPlan } from 'src/modules/plans/master-plans/master-plan.entity';

export enum ClientPlanStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
}

@Entity('client_plans')
export class ClientPlan extends BaseEntity {

    @Column('uuid')
    client_id: string;

    @Column('uuid')
    clinic_id: string;

    @Column('uuid')
    master_plan_id: string;

    @ManyToOne(() => MasterPlan)
    @JoinColumn({ name: 'master_plan_id' })
    master_plan: MasterPlan;

    @Column('date')
    start_date: Date;

    @Column('date')
    end_date: Date;

    @Column({ default: 1 })
    version: number;

    @Column('decimal')
    subscribed_amount: number;

    @Column('decimal', { default: 0 })
    discount_applied: number;

    @Column('decimal')
    final_amount: number;

    @Column({
        type: 'enum',
        enum: ClientPlanStatus,
        default: ClientPlanStatus.ACTIVE,
    })
    status: ClientPlanStatus;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PAID,
    })
    payment_status: PaymentStatus;

    @Column('uuid')
    created_by: string;
}
