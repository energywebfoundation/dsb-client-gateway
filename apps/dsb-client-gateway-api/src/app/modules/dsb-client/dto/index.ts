import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class FileUploadQueryDto {
  @IsString()
  @IsNotEmpty()
  public fqcn: string;

  @IsString()
  @IsNotEmpty()
  public topic: string;
}

export class SendMessageBodyDto {
  @IsString()
  @IsNotEmpty()
  public fqcn: string;

  @IsString()
  @IsNotEmpty()
  public topic: string;

  @IsNotEmpty()
  public payload: object;
}

export class GetMessagesQueryDto {
  @IsNotEmpty()
  @IsString()
  public fqcn: string;

  @IsPositive()
  @IsOptional()
  public amount?: number;

  @IsDateString()
  @IsOptional()
  public from?: string;

  @IsString()
  @IsOptional()
  public clientId?: string;
}
