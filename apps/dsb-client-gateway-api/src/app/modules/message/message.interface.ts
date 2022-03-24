
export interface SendMessageSuccessResponse {
    did: string
    messageId: string
    statusCode: number
    err: {
        code: string
        reason: string
        additionalInformation: object
    }
}
export interface SendMessageFailedResponse {
    did: string
    messageId: string
    statusCode: number
    err: {
        code: string
        reason: string
        additionalInformation: object
    }
}

export interface SendInetrnalMessageResponse {
    id: string;
}
export interface SendMessageResponse {
    clientGatewayMessageId: string
    did: string
    success: SendMessageSuccessResponse[]
    failed: SendMessageFailedResponse[]
}