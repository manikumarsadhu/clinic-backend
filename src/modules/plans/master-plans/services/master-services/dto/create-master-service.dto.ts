import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateMasterServiceDto {
    @IsString()
    name: string;

    @IsString()
    category_id: string;

    @IsNumber()
    standard_price: number;

    @IsOptional()
    @IsNumber()
    special_offer_price?: number;

    @IsOptional()
    @IsBoolean()
    is_free_allowed?: boolean;

    @IsOptional()
    @IsString()
    description?: string;
}
