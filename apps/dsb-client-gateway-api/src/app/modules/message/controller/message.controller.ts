import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SendMessageDto,
  uploadMessageBodyDto,
} from '../dto/request/send-message.dto';
import { MessageService } from '../service/message.service';
import { DigestGuard } from '../../utils/guards/digest.guard';
import { SendMessagelResponseDto } from '../dto/response/send-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('messages')
@UseGuards(DigestGuard)
@ApiTags('Messaging')
export class MessageControlller {
  constructor(protected readonly messageService: MessageService) {}

  @Post('/')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message sent successfully',
    type: () => SendMessagelResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed or some requirements were not fully satisfied',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found or Topic not found',
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() dto: SendMessageDto
  ): Promise<SendMessagelResponseDto> {
    return this.messageService.sendMessage(dto);
  }

  @Post('upload')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File Upload Successfully',
    type: () => SendMessagelResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed or some requirements were not fully satisfied',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found or Topic not found',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile('file') file: Express.Multer.File,
    @Body() dto: uploadMessageBodyDto
  ): Promise<SendMessagelResponseDto> {
    return this.messageService.uploadMessage(file, dto);
  }
}
