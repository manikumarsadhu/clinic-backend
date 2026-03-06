import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MasterPlanService } from "./master-plan-service.entity";
import { Repository } from "typeorm";
import { MasterPlan } from "../master-plan.entity";
import { MasterService } from "../services/master-services/master-service.entity";
import { CreateMasterPlanServiceDto } from "./dto/create-master-plan-service.dto";

@Injectable()
export class MasterPlanServiceService {

    constructor(
        @InjectRepository(MasterPlanService)
        private repo: Repository<MasterPlanService>,

        @InjectRepository(MasterPlan)
        private planRepo: Repository<MasterPlan>,

        @InjectRepository(MasterService)
        private serviceRepo: Repository<MasterService>,
    ) { }

    async create(dto: CreateMasterPlanServiceDto) {

        const plan = await this.planRepo.findOne({
            where: { id: dto.master_plan_id, is_active: true },
        });

        if (!plan) {
            throw new BadRequestException('Invalid or inactive plan');
        }

        const service = await this.serviceRepo.findOne({
            where: { id: dto.master_service_id, is_active: true },
        });

        if (!service) {
            throw new BadRequestException('Invalid or inactive service');
        }

        const existing = await this.repo.findOne({
            where: {
                master_plan: { id: dto.master_plan_id },
                master_service: { id: dto.master_service_id },
            },
        });

        if (existing) {
            throw new BadRequestException('Service already mapped to plan');
        }

        const mapping = this.repo.create(dto);

        return this.repo.save(mapping);
    }

    async findByPlan(planId: string) {
        return this.repo.find({
            where: { master_plan_id: planId },
            relations: ['master_service'],
        });
    }

    async softDelete(id: string) {
        await this.repo.softDelete(id);
        return { message: 'Mapping removed successfully' };
    }
}