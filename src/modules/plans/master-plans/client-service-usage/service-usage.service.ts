import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateServiceUsageDto } from './dto/create-service-usage.dto';
import { ClientPlan, ClientPlanStatus } from '../client-plans/client-plan.entity';
import { ClientPlanService as ClientPlanServiceEntity } from '../client-plan-services/client-plan-service.entity';
import { ClientServiceTransaction, UsageType } from './client-service-transaction.entity';
import { MasterService } from '../services/master-services/master-service.entity';

@Injectable()
export class ServiceUsageService {
    constructor(
        @InjectRepository(ClientPlan)
        private readonly clientPlanRepo: Repository<ClientPlan>,

        @InjectRepository(ClientPlanServiceEntity)
        private readonly clientPlanServiceRepo: Repository<ClientPlanServiceEntity>,

        @InjectRepository(ClientServiceTransaction)
        private readonly transactionRepo: Repository<ClientServiceTransaction>,

        @InjectRepository(MasterService)
        private readonly masterServiceRepo: Repository<MasterService>,
    ) { }

    async useService(dto: CreateServiceUsageDto, clinicId: string, userId: string) {

        // Get active client plan (if exists)
        const clientPlan = await this.clientPlanRepo.findOne({
            where: {
                client_id: dto.client_id,
                clinic_id: clinicId,
                status: ClientPlanStatus.ACTIVE,
            },
        });

        // Validate master service
        const masterService = await this.masterServiceRepo.findOne({
            where: {
                id: dto.master_service_id,
                is_active: true,
            },
        });

        if (!masterService) {
            throw new BadRequestException('Invalid or inactive service');
        }

        let chargedAmount = masterService.standard_price;
        let usageType = UsageType.OUTSIDE_PLAN;
        let clientPlanService: ClientPlanServiceEntity | null = null;

        // If client has active plan, check if service included
        if (clientPlan) {
            clientPlanService = await this.clientPlanServiceRepo.findOne({
                where: {
                    client_plan_id: clientPlan.id,
                    master_service_id: dto.master_service_id,
                },
            });

            if (clientPlanService && clientPlanService.remaining_count > 0) {

                usageType = UsageType.FROM_PLAN;

                if (clientPlanService.included_free) {
                    chargedAmount = 0;
                } else if (clientPlanService.discounted_price) {
                    chargedAmount = Number(clientPlanService.discounted_price);
                }

                // Deduct usage
                clientPlanService.used_count += 1;
                clientPlanService.remaining_count -= 1;

                await this.clientPlanServiceRepo.save(clientPlanService);
            }
        }

        const discount = dto.discount_applied || 0;
        const finalAmount = chargedAmount - discount;

        // Create transaction record
        const transactionData: Partial<ClientServiceTransaction> = {
            client_plan_service_id: clientPlanService?.id || null,
            client_id: dto.client_id,
            clinic_id: clinicId,
            charged_amount: chargedAmount,
            discount_applied: discount,
            final_amount: finalAmount,
            service_date: new Date(),
            usage_type: usageType,
            created_by: userId,
        };

        const transaction = await this.transactionRepo.save(transactionData);

        return transaction;
    }
}
