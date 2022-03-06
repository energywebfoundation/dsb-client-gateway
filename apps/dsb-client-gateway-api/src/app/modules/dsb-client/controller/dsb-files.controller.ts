import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadQueryDto } from '../dto';
import { DigestGuard } from '../../utils/guards/digest.guard';

@Controller('dsb')
@UseGuards(DigestGuard)
export class DsbFilesController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @Query() query: FileUploadQueryDto,
    @UploadedFile('file') file: Express.Multer.File
  ): Promise<void> {}
}
