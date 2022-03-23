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


@Controller('message')

export class MessageControlller {
    constructor() { }

    @Post()
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: '',
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
        console.log('dto', dto)

        // await this.channelService.createChannel(dto);
    }
}
