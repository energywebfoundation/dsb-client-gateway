import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendMessageDto } from '../dto/request/send-message.dto';
import { MessageService } from '../service/message.service'



@Controller('message')
@ApiTags('send-message')

export class MessageControlller {
    constructor(
        protected readonly messageService: MessageService) { }

    @Post()
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'message sent successfully',
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
    @HttpCode(HttpStatus.CREATED)
    public async create(
        @Body() dto: SendMessageDto
    ): Promise<void> {
        await this.messageService.sendMessage(dto)
    }
}
