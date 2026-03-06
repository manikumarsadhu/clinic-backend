import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { ClientPlan } from '../client-plans/client-plan.entity';
import { MasterService } from '../services/master-services/master-service.entity';

@Entity('client_plan_services')
export class ClientPlanService extends BaseEntity {

    @Column('uuid')
    client_plan_id: string;

    @ManyToOne(() => ClientPlan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_plan_id' })
    client_plan: ClientPlan;

    @Column('uuid')
    master_service_id: string;

    @ManyToOne(() => MasterService)
    @JoinColumn({ name: 'master_service_id' })
    master_service: MasterService;

    @Column({ default: 0 })
    included_sessions_count: number;

    @Column({ default: false })
    included_free: boolean;

    @Column('decimal', { nullable: true })
    discounted_price: number;

    @Column({ default: 0 })
    usage_limit: number;

    @Column({ default: 0 })
    used_count: number;

    @Column({ default: 0 })
    remaining_count: number;
}
