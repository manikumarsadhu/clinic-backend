import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { MasterPlan } from '../master-plan.entity';
import { MasterService } from 'src/modules/plans/master-plans/services/master-services/master-service.entity';

@Entity('master_plan_services')
@Unique(['master_plan_id', 'master_service_id'])
export class MasterPlanService extends BaseEntity {

    @Column('uuid')
    master_plan_id: string;

    @ManyToOne(() => MasterPlan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'master_plan_id' })
    master_plan: MasterPlan;

    @Column('uuid')
    master_service_id: string;

    @ManyToOne(() => MasterService, { onDelete: 'CASCADE' })
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
}