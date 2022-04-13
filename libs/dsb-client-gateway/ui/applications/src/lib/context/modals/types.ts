import { ApplicationDTO } from '@dsb-client-gateway/dsb-client-gateway-api-client'
import { ApplicationsModalsActionsEnum } from './reducer';

export interface IApplicationsModalsStore {
  createTopic: {
    open: boolean;
    hide: boolean;
    application: ApplicationDTO;
  };
}

interface IShowCreateTopicAction {
  type: ApplicationsModalsActionsEnum.SHOW_CREATE_TOPIC;
  payload: {
    open: boolean;
    hide: boolean;
    application: ApplicationDTO;
  };
}

export type TApplicationsModalsAction =
  | IShowCreateTopicAction
