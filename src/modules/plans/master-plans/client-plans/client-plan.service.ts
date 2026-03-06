import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateClientPlanDto } from './dto/create-client-plan.dto';
import { ClientPlan, ClientPlanStatus, PaymentStatus } from './client-plan.entity';
import { ClientPlanService as ClientPlanServiceEntity } from '../client-plan-services/client-plan-service.entity';
import { MasterPlan } from '../master-plan.entity';
import { MasterPlanService as MasterPlanServiceEntity } from '../master-plan-services/master-plan-service.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { ListClientPlanDto } from './dto/list-client-plan.dto';
import { UpgradeClientPlanDto } from './dto/upgrade-client-plan.dto';
import { PlanPublishStatus } from '../master-plan.entity';

@Injectable()
export class ClientPlanService {
    constructor(
        @InjectRepository(ClientPlan)
        private readonly clientPlanRepo: Repository<ClientPlan>,

        @InjectRepository(ClientPlanServiceEntity)
        private readonly clientPlanServiceRepo: Repository<ClientPlanServiceEntity>,

        @InjectRepository(MasterPlan)
        private readonly masterPlanRepo: Repository<MasterPlan>,

        @InjectRepository(MasterPlanServiceEntity)
        private readonly masterPlanServiceRepo: Repository<MasterPlanServiceEntity>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async assignPlan(dto: CreateClientPlanDto, clinicId: string) {
        // Validate Client
        const client = await this.userRepo.findOne({
            where: { id: dto.client_id, role: UserRole.CLIENT },
        });

        if (!client) {
            throw new BadRequestException('Invalid client');
        }

        // Validate Clinic
        const clinic = await this.userRepo.findOne({
            where: { id: clinicId, role: UserRole.CLINIC },
        });

        if (!clinic) {
            throw new BadRequestException('Invalid clinic');
        }

        // Validate Master Plan
        const masterPlan = await this.masterPlanRepo.findOne({
            where: { id: dto.master_plan_id, is_active: true },
        });

        if (!masterPlan) {
            throw new BadRequestException('Invalid or inactive master plan');
        }

        // Block if client already active plan
        const existingActive = await this.clientPlanRepo.findOne({
            where: {
                client_id: dto.client_id,
                status: ClientPlanStatus.ACTIVE,
            },
        });

        if (existingActive) {
            throw new BadRequestException('Client already has active plan');
        }

        // Calculate Dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + masterPlan.duration_in_days);

        const discount = dto.discount_applied || 0;
        const finalAmount = dto.subscribed_amount - discount;

        // Create Client Plan
        const clientPlan = (await this.clientPlanRepo.save({
            client_id: dto.client_id,
            clinic_id: clinicId,
            master_plan_id: dto.master_plan_id,
            start_date: startDate,
            end_date: endDate,
            version: 1,
            subscribed_amount: dto.subscribed_amount,
            discount_applied: discount,
            final_amount: finalAmount,
            payment_status: dto.payment_status || PaymentStatus.PAID,
            created_by: clinicId,
        })) as ClientPlan;

        // Fetch Master Plan Services
        const planServices = await this.masterPlanServiceRepo.find({
            where: {
                master_plan: { id: dto.master_plan_id },
            },
        });

        // Copy Snapshot
        for (const service of planServices) {
            await this.clientPlanServiceRepo.save({
                client_plan_id: clientPlan.id,
                master_service_id: service.master_service_id,
                included_sessions_count: service.included_sessions_count,
                included_free: service.included_free,
                discounted_price: service.discounted_price,
                usage_limit: service.usage_limit,
                used_count: 0,
                remaining_count: service.usage_limit,
            });
        }

        return clientPlan;
    }

    async listSubscriptions(
        clinicId: string,
        query: ListClientPlanDto,
    ) {
        const {
            status,
            search,
            page = 1,
            limit = 10,
        } = query;

        const qb = this.clientPlanRepo
            .createQueryBuilder('cp')
            .leftJoinAndSelect('cp.master_plan', 'plan')
            .leftJoinAndSelect('users', 'client', 'client.id = cp.client_id')
            .where('cp.clinic_id = :clinicId', { clinicId });

        if (status) {
            qb.andWhere('cp.status = :status', { status });
        }

        if (search) {
            qb.andWhere('LOWER(client.name) LIKE LOWER(:search)', {
                search: `%${search}%`,
            });
        }

        qb.orderBy('cp.created_at', 'DESC');

        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(total / limit),
        };
    }

    async upgradePlan(dto: UpgradeClientPlanDto, clinicId: string, userId: string) {

        // Get current active plan
        const currentPlan = await this.clientPlanRepo.findOne({
            where: {
                client_id: dto.client_id,
                clinic_id: clinicId,
                status: ClientPlanStatus.ACTIVE,
            },
            relations: ['master_plan'],
        });

        if (!currentPlan) {
            throw new BadRequestException('No active plan found');
        }

        // Get new master plan
        const newMasterPlan = await this.masterPlanRepo.findOne({
            where: {
                id: dto.new_master_plan_id,
                status: PlanPublishStatus.PUBLISH,
                is_active: true,
                is_upgradeable: true,
            },
        });

        if (!newMasterPlan) {
            throw new BadRequestException('Cannot upgrade. Plan is not published');
        }

        // if (newMasterPlan.base_price <= currentPlan.master_plan.base_price) {
        //     throw new BadRequestException('Downgrade not allowed');
        // }

        if (currentPlan.master_plan_id === dto.new_master_plan_id) {
            throw new BadRequestException('Already using this plan');
        }

        // bump version if tracking upgrades
        const newVersion = currentPlan.version + 1;
        currentPlan.version = newVersion;
        await this.clientPlanRepo.save(currentPlan);

        // Calculate remaining value
        const today = new Date();
        const totalDays = currentPlan.master_plan.duration_in_days;

        const remainingDays =
            (new Date(currentPlan.end_date).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24);

        const unusedValue =
            (remainingDays > 0 ? remainingDays : 0) / totalDays *
            Number(currentPlan.final_amount);

        const upgradeAmount =
            Number(newMasterPlan.base_price) - unusedValue;

        const payableAmount = upgradeAmount > 0 ? upgradeAmount : 0;

        // Cancel old plan
        currentPlan.status = ClientPlanStatus.CANCELLED;
        await this.clientPlanRepo.save(currentPlan);

        // Create new plan
        const newClientPlan = await this.clientPlanRepo.save({
            client_id: dto.client_id,
            clinic_id: clinicId,
            master_plan_id: newMasterPlan.id,
            start_date: today,
            end_date: new Date(today.getTime() + newMasterPlan.duration_in_days * 86400000),
            version: newVersion,
            subscribed_amount: newMasterPlan.base_price,
            discount_applied: 0,
            final_amount: payableAmount,
            status: ClientPlanStatus.ACTIVE,
            payment_status: PaymentStatus.PAID,
            created_by: userId,
        });

        return {
            message: 'Plan upgraded successfully',
            payableAmount,
            newPlan: newClientPlan,
        };
    }

    async getClientPlans(clientId: string, clinicId: string) {

        const plans = await this.clientPlanRepo.find({
            where: {
                client_id: clientId,
                clinic_id: clinicId
            },
            relations: ['master_plan'],
            order: {
                created_at: 'DESC'
            }
        });

        const activePlan = plans.find(
            plan => plan.status === ClientPlanStatus.ACTIVE
        );

        const oldPlans = plans.filter(
            plan => plan.status !== ClientPlanStatus.ACTIVE
        );

        return {
            activePlan,
            oldPlans
        };
    }

}
