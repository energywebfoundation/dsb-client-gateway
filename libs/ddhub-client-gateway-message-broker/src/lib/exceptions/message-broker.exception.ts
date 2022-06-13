import {
  BaseException,
  DsbClientGatewayErrors,
} from '@dsb-client-gateway/dsb-client-gateway-errors';
import { MessageBrokerErrors } from '../ddhub-client-gateway-message-broker.const';
import { HttpStatus } from '@nestjs/common';

export class MessageBrokerException extends BaseException {
  constructor(
    message: string,
    code: DsbClientGatewayErrors,
    errorCode: string | MessageBrokerErrors,
    path: string
  ) {
    super(
      message,
      code,
      {
        errorCode,
        path,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}