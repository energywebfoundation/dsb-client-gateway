import { BadRequestException } from '@nestjs/common';
import { DsbClientGatewayErrors } from '@dsb-client-gateway/dsb-client-gateway-errors';

export class TLSCertificatesNotUploaded extends BadRequestException {
  public code: DsbClientGatewayErrors;
  constructor() {
    super('mTLS certicates not uploaded');
    this.code = DsbClientGatewayErrors.TLS_CERTIFICATES_NOT_UPLOADED;
  }
}
