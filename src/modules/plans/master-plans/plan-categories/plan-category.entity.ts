import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { MasterService } from '../services/master-services/master-service.entity';

@Entity('plan_categories')
export class PlanCategory {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => MasterService, (service) => service.category)
    services: MasterService[];
}
