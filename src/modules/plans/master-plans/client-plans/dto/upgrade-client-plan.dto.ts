import { IsUUID } from 'class-validator';

export class UpgradeClientPlanDto {

    @IsUUID()
    client_id: string;

    @IsUUID()
    new_master_plan_id: string;
}
