import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  // LIST CLINICS
  async findMyClinics(superAdminId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // prevent large limit abuse
    limit = Math.min(limit, 50);

    const [clinics, total] = await this.userRepo.findAndCount({
      where: {
        role: UserRole.CLINIC,
        parentId: superAdminId,
        isDeleted: false,
      },
      order: {
        id: 'ASC',   // stable sorting
      },
      skip,
      take: limit,
    });
    return {
      data: clinics,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };

  }

  // ADD CLINIC
  async createClinic(superAdminId: string, data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const clinic = this.userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: UserRole.CLINIC,
      parentId: superAdminId,
      isActive: true,
      isDeleted: false,
    });

    return this.userRepo.save(clinic);
  }

  // UPDATE CLINIC
  async updateClinic(clinicId: string, data: any) {
    const clinic = await this.userRepo.findOne({
      where: { id: clinicId, isDeleted: false },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    if (data.password) {
      clinic.password = await bcrypt.hash(data.password, 10);
    }

    clinic.name = data.name ?? clinic.name;
    clinic.email = data.email ?? clinic.email;
    return this.userRepo.save(clinic);
  }

  // SOFT DELETE
  async softDeleteClinic(clinicId: string) {
    const clinic = await this.userRepo.findOne({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    clinic.isDeleted = true;
    clinic.isActive = false; // optional but recommended

    return this.userRepo.save(clinic);
  }

  // TOGGLE STATUS
  async toggleClinicStatus(clinicId: string, isActive: boolean) {
    const clinic = await this.userRepo.findOne({
      where: { id: clinicId, isDeleted: false },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    clinic.isActive = isActive;

    return this.userRepo.save(clinic);
  }

  // CLINIC → View only its clients
  async findClientsOfClinic(
    clinicId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    limit = Math.min(limit, 50);

    const [clients, total] = await this.userRepo.findAndCount({
      where: {
        role: UserRole.CLIENT,
        parentId: clinicId,
        isDeleted: false,
      },
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: clients,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async createClient(clinicId: string, body: any) {
    const client = this.userRepo.create({
      ...body,
      role: UserRole.CLIENT,
      parentId: clinicId,
    });

    return this.userRepo.save(client);
  }

  async updateClient(clientId: string, body: any) {
    await this.userRepo.update(clientId, body);
    return { message: 'Client updated successfully' };
  }

  async softDeleteClient(clientId: string) {
    await this.userRepo.update(clientId, {
      isDeleted: true,
      isActive: false,
    });

    return { message: 'Client deleted successfully' };
  }

  async findMyClients(clinicId: string) {
    return this.userRepo.find({
      where: {
        role: UserRole.CLIENT,
        parentId: clinicId,
      },
    });
  }

  // SUPER_ADMIN → clients under all their clinics
  async findClientsUnderSuperAdmin(superAdminId: string) {
    return this.userRepo
      .createQueryBuilder('client')
      .where('client.role = :clientRole', { clientRole: UserRole.CLIENT })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('clinic.id')
          .from('users', 'clinic')
          .where('clinic.role = :clinicRole')
          .andWhere('clinic.parentId = :superAdminId')
          .getQuery();
        return 'client.parentId IN ' + subQuery;
      })
      .setParameters({
        clinicRole: UserRole.CLINIC,
        superAdminId,
      })
      .getMany();
  }

  async findOne(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
