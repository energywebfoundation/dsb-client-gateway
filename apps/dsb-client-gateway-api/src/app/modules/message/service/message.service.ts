import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from '../gateway/events.gateway';
import { ConfigService } from '@nestjs/config';
import { Message } from '../../dsb-client/dsb-client.interface';
import { DsbApiService } from '../../dsb-client/service/dsb-api.service';
import { SendMessageDto } from '../dto/request/send-message.dto'
import { ChannelService } from '../../channel/service/channel.service'
import { IsSchemaValid } from '../../utils/validator/decorators/IsSchemaValid'

export enum EventEmitMode {
  SINGLE = 'SINGLE',
  BULK = 'BULK',
}

@Injectable()
export class MessageService {

  protected readonly logger = new Logger(MessageService.name);

  constructor(
    protected readonly gateway: EventsGateway,
    protected readonly configService: ConfigService,
    protected readonly dsbApiService: DsbApiService,
    protected readonly channelService: ChannelService
  ) { }

  public async sendMessagesToSubscribers(
    messages: Message[],
    fqcn: string
  ): Promise<void> {
    const emitMode: EventEmitMode = this.configService.get(
      'EVENTS_EMIT_MODE',
      EventEmitMode.BULK
    );

    if (emitMode === EventEmitMode.BULK) {
      this.broadcast(messages.map((message) => ({ ...message, fqcn })));

      return;
    }

    messages.forEach((message: Message) => {
      this.broadcast({ ...message, fqcn });
    });
  }

  private broadcast(data): void {
    this.gateway.server.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    });
  }

  public async sendMessage(dto: SendMessageDto): Promise<void> {


    //get this schema from topic cache given by Kris
    const schema = {
      type: "object",
      properties: {
        foo: { type: "string" },
        bar: { type: "number", maximum: 3 },
      },
      required: ["foo", "bar"],
      additionalProperties: false,
    }


    const isSchemaValid = IsSchemaValid(schema, dto.payload)


    await this.channelService.getChannelOrThrow(dto.fqcn)

  }

}
