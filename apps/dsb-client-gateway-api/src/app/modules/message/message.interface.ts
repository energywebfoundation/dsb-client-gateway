export interface SendMessageSuccessResponse {
  did: string;
  messageId: string;
  statusCode: number;
}
export interface SendMessageFailedResponse {
  did: string;
  messageId: string;
  statusCode: number;
  err: {
    code: string;
    reason: string;
    additionalInformation: object;
  };
}

export interface SendInternalMessageResponse {
  id: string;
}

export interface Recipients {
  total: number;
  sent: number;
  failed: number;
}

export interface details {
  did?: string;
  messageId?: string;
  statusCode?: number;
}

export interface status {
  details: details[];
  name: string;
}
export interface SendMessageResponse {
  clientGatewayMessageId: string;
  did: string;
  recipients: Recipients;
  status: status[];
}
