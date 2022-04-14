import { GatewayError } from './errors';
import { BalanceState, Enrolment, EnrolmentState } from '@dsb-client-gateway/dsb-client-gateway/identity/models';

export type Result<T = boolean, E = GatewayError> = {
  ok?: T;
  err?: E;
};

export type Option<T> = {
  some?: T;
  none?: boolean;
};

export type Identity = {
  address: string;
  publicKey: string;
  privateKey: string;
  balance: BalanceState;
};

export type File = {
  name: string;
  value: string;
};

export type CertificateFiles = {
  cert: File;
  key?: File;
  ca?: File;
};

export type Encryption = {
  publicKey: string;
  privateRSAKey: string;
};

export type Storage = {
  identity?: Identity;
  enrolment?: Enrolment;
  certificate?: CertificateFiles;
};

export type SendMessageData = {
  fqcn: string;
  topic: string;
  payload: string;
  transactionId?: string;
  signature: string;
};

export type SendMessageResult = {
  id: string;
};

export type GetMessageOptions = {
  fqcn: string;
  amount?: number;
  clientId?: string;
};

export type Message = {
  id: string;
  fqcn?: string;
  topic: string;
  payload: string;
  sender: string;
  signature: string;
  timestampNanos: number;
  transactionId?: string;
};

export type Channel = {
  fqcn: string;
  topics?: Topic[];
  admins?: string[];
  publishers?: string[];
  subscribers?: string[];
  maxMsgAge?: number;
  maxMsgSize?: number;
  createdBy: string;
  createdDateTime: string;
  modifiedBy?: string;
  modifiedDateTime?: string;
};

export type Topic = {
  id: string;
  name: string;
  owner: string;
  schema: object | string;
  schemaType: string;
  version: string;
  namespace?: string
};

export enum StringType {
  STANDARD,
  HEX,
  HEX_COMPRESSED,
  DID,
}

export type WebSocketClientOptions = {
  url: string;
  protocol?: string;
  reconnect?: boolean;
  reconnectTimeout?: number;
  reconnectMaxRetries?: number;
};

export enum EventEmitMode {
  SINGLE = 'SINGLE',
  BULK = 'BULK',
}

export type Application = {
  appName: string
  logoUrl?: string
  websiteUrl?: string
  description?: string
}


export type ApplicationHeader = {
  id?: string
  Header?: string
  accessor: string
  filter?: string
  Cell?: any
}

export type PostTopicResult = {
  id: string
  name: string
  schemaType: string
  schema: string
  version: string
  owner: string,
  tags: string[]
}


export type GetTopicsOptions = {
  limit?: number
  name: string
  owner: string
  page?: number
  tags?: string[]
}

export type SendTopicData = {
  name: string
  schemaType: string
  schema: string
  version: string
  signature: string
  owner: string
  tags: string[]
}


export type EnrolmentManager = {
  /**
   * Decentralized Identifer (DID) belonging to gateway identity
   */
  did: string;
  /**
   * Get enrolment status of the configured DID
   *
   * @returns individual state of messagebroker and user roles
   */
  getState: () => Promise<Result<EnrolmentState>>;
  /**
   * Creates enrolment claims (messagebroker and user) for gateway identity
   *
   * @param state current state, retreived from getEnrolmentState
   * @returns ok (boolean) or error code
   */
  handle: (state: EnrolmentState) => Promise<Result>;
  /**
   * Persists gateway identity to json file
   *
   * @returns ok (boolean) or error code
   */
  save: (state: EnrolmentState) => Promise<Result>;
};