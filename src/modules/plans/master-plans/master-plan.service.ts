import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MasterPlan, PlanPublishStatus } from "./master-plan.entity";
import { PlanCategory } from "./plan-categories/plan-category.entity";
import { CreateMasterPlanDto } from "./dto/create-master-plan.dto";
import { ListMasterPlanDto } from "./dto/list-master-plan.dto";
import { UpdateMasterPlanDto } from "./dto/update-master-plan.dto";
import { MasterPlanService as MasterPlanServiceEntity } from "./master-plan-services/master-plan-service.entity";

@Injectable()
export class MasterPlanService {

    constructor(
        @InjectRepository(MasterPlan)
        private masterPlanRepository: Repository<MasterPlan>,

        @InjectRepository(PlanCategory)
        private planCategoryRepository: Repository<PlanCategory>,

        // repository for plan-service mappings used when publishing a plan
        @InjectRepository(MasterPlanServiceEntity)
        private planServiceRepo: Repository<MasterPlanServiceEntity>,
    ) { }

    async create(dto: CreateMasterPlanDto, userId: string) {
        if (!userId) {
            // this shouldn't normally happen if the JWT strategy is configured
            // correctly, but guard against it so we don't try inserting a null
            // value into the database.
            throw new BadRequestException('Missing user information');
        }

        const category = await this.planCategoryRepository.findOne({
            where: { id: dto.category_id, is_active: true },
        });

        if (!category) {
            throw new BadRequestException('Invalid category');
        }

        const plan = this.masterPlanRepository.create({
            ...dto,
            category,
            created_by: userId,
        });

        return this.masterPlanRepository.save(plan);
    }

    async findAll(query: ListMasterPlanDto) {
        const {
            age_group,
            category_id,
            is_active,
            page = 1,
            limit = 10,
        } = query;

        const qb = this.masterPlanRepository
            .createQueryBuilder('plan')
            .leftJoinAndSelect('plan.category', 'category')
            .where('plan.deleted_at IS NULL');

        if (age_group) {
            qb.andWhere('plan.age_group = :age_group', { age_group });
        }

        if (category_id) {
            qb.andWhere('category.id = :category_id', { category_id });
        }

        if (is_active !== undefined) {
            // DTO now returns a string, convert to boolean before querying
            qb.andWhere('plan.is_active = :is_active', {
                is_active: is_active === 'true',
            });
        }

        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const plan = await this.masterPlanRepository.findOne({
            where: { id },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        return plan;
    }

    async update(id: string, dto: UpdateMasterPlanDto, userId: string) {
        const plan = await this.masterPlanRepository.findOne({
            where: { id },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        // only draft plans can be modified; once published the definition is frozen
        if (plan.status !== PlanPublishStatus.DRAFT) {
            throw new BadRequestException(
                'Only plans in DRAFT status can be updated'
            );
        }

        if (dto.category_id) {
            const category = await this.planCategoryRepository.findOne({
                where: { id: dto.category_id, is_active: true },
            });

            if (!category) {
                throw new BadRequestException('Invalid category');
            }

            plan.category = category;
        }

        Object.assign(plan, dto);
        plan.updated_by = userId;

        return this.masterPlanRepository.save(plan);
    }

    async toggleStatus(id: string, is_active: boolean) {
        const plan = await this.masterPlanRepository.findOne({
            where: { id },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        plan.is_active = is_active;

        return this.masterPlanRepository.save(plan);
    }

    async softDelete(id: string) {
        const plan = await this.masterPlanRepository.findOne({
            where: { id },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        await this.masterPlanRepository.softDelete(id);

        return { message: 'Plan deleted successfully' };
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }

    async publishPlan(id: string) {

        const plan = await this.masterPlanRepository.findOne({
            where: { id },
        });

        if (!plan) {
            throw new BadRequestException('Plan not found');
        }

        // Check if plan has at least one service mapping
        // use the mapping repository since services themselves aren't
        // directly tied to the plan entity
        const mappedCount = await this.planServiceRepo.count({
            where: { master_plan_id: id },
        });

        if (mappedCount === 0) {
            throw new BadRequestException(
                'Cannot publish plan without services'
            );
        }

        // Already published
        if (plan.status === PlanPublishStatus.PUBLISH) {
            throw new BadRequestException('Plan already published');
        }

        // Change status
        plan.status = PlanPublishStatus.PUBLISH;
        // Increase version
        // plan.version += 1;

        return await this.masterPlanRepository.save(plan);
    }
}
