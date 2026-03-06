import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MasterService } from "./master-service.entity";
import { PlanCategory } from '../../plan-categories/plan-category.entity';
import { Repository } from "typeorm";
import { CreateMasterServiceDto } from "./dto/create-master-service.dto";
import { UpdateMasterServiceDto } from "./dto/update-master-service.dto";

@Injectable()
export class MasterServiceService {
    constructor(
        @InjectRepository(MasterService)
        private serviceRepo: Repository<MasterService>,
        @InjectRepository(PlanCategory)
        private categoryRepo: Repository<PlanCategory>,
    ) { }

    async create(dto: CreateMasterServiceDto, userId: string) {

        const category = await this.categoryRepo.findOne({
            where: { id: dto.category_id, is_active: true },
        });

        if (!category) {
            throw new BadRequestException('Invalid category');
        }

        const existing = await this.serviceRepo.findOne({
            where: { name: dto.name.trim() },
        });

        if (existing) {
            throw new BadRequestException('Service already exists');
        }

        const service = this.serviceRepo.create({
            ...dto,
            name: dto.name.trim(),
            is_free_allowed: dto.is_free_allowed ?? false,
            is_active: true,
            created_by: userId,
        });

        return this.serviceRepo.save(service);
    }

    async findAll(query) {
        const {
            category,
            is_active,
            page = 1,
            limit = 10,
        } = query;

        const qb = this.serviceRepo
            .createQueryBuilder('service');

        if (category) {
            qb.andWhere('service.category_id = :category', { category });
        }

        if (is_active !== undefined) {
            qb.andWhere('service.is_active = :is_active', { is_active });
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

    async update(id: string, dto: UpdateMasterServiceDto, userId: string) {
        const service = await this.serviceRepo.findOne({
            where: { id },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        Object.assign(service, dto);
        service.updated_by = userId;

        return this.serviceRepo.save(service);
    }

    async toggleStatus(id: string, is_active: boolean) {
        const service = await this.serviceRepo.findOne({
            where: { id },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        service.is_active = is_active;

        return this.serviceRepo.save(service);
    }

    async softDelete(id: string) {
        await this.serviceRepo.softDelete(id);
        return { message: 'Service deleted successfully' };
    }
}

