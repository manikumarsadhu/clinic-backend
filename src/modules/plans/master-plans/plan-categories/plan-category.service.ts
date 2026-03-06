import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanCategory } from './plan-category.entity';
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto';
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto';
import { ListPlanCategoryDto } from './dto/list-plan-category.dto';

@Injectable()
export class PlanCategoryService {
    constructor(
        @InjectRepository(PlanCategory)
        private readonly repo: Repository<PlanCategory>,
    ) { }

    async create(dto: CreatePlanCategoryDto) {
        const existing = await this.repo.findOne({
            where: { name: dto.name.trim() },
        });

        if (existing) {
            throw new BadRequestException('Category already exists');
        }

        const category = this.repo.create({
            name: dto.name.trim(),
            description: dto.description?.trim(),
            is_active: dto.is_active ?? true,
        });

        return await this.repo.save(category);
    }

    async findAll(query: ListPlanCategoryDto) {
        const { is_active, page = 1, limit = 10 } = query;

        const qb = this.repo.createQueryBuilder('category');

        if (is_active !== undefined) {
            qb.andWhere('category.is_active = :is_active', {
                is_active: is_active === 'true',
            });
        }

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

    async update(id: string, dto: UpdatePlanCategoryDto) {
        const category = await this.repo.findOne({ where: { id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        Object.assign(category, dto);

        return this.repo.save(category);
    }

    async toggleStatus(id: string, is_active: boolean) {
        const category = await this.repo.findOne({ where: { id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        category.is_active = is_active;

        return this.repo.save(category);
    }

    async softDelete(id: string) {
        const category = await this.repo.findOne({ where: { id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await this.repo.softDelete(id);

        return { message: 'Category deleted successfully' };
    }
}