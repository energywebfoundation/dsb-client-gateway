export interface Topic {
  namespace: string
  schema: object | string
}


export interface Channel {
  fqcn: string
  topics?: Topic[]
  admins?: string[]
  publishers?: string[]
  subscribers?: string[]
  maxMsgAge?: number
  maxMsgSize?: number
  createdBy: string
  createdDateTime: string
  modifiedBy?: string
  modifiedDateTime?: string
}
