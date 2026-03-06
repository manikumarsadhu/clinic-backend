import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { ClientPlanService } from '../client-plan-services/client-plan-service.entity';

export enum UsageType {
    FROM_PLAN = 'FROM_PLAN',
    OUTSIDE_PLAN = 'OUTSIDE_PLAN',
}

@Entity('client_service_transactions')
export class ClientServiceTransaction extends BaseEntity {

    @Column({
        type: 'enum',
        enum: UsageType,
        default: UsageType.OUTSIDE_PLAN,
        nullable: true,
    })
    usage_type: UsageType | null;

    @Column('uuid', { nullable: true })
    client_plan_service_id: string | null;

    @ManyToOne(() => ClientPlanService, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_plan_service_id' })
    client_plan_service: ClientPlanService;

    @Column('uuid')
    client_id: string;

    @Column('uuid')
    clinic_id: string;

    @Column('decimal')
    charged_amount: number;

    @Column('decimal', { default: 0 })
    discount_applied: number;

    @Column('decimal')
    final_amount: number;

    @Column('timestamp')
    service_date: Date;

    @Column('uuid')
    created_by: string;
}
