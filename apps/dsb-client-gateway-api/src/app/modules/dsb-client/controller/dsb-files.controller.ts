import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DigestGuard } from '../../utils/guards/digest.guard';
import { DsbApiService } from '../service/dsb-api.service';
import { FileUploadBodyDto } from '../dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('dsb')
@ApiTags('files', 'dsb')
@UseGuards(DigestGuard)
export class DsbFilesController {}
