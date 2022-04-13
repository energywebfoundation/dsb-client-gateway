import { IApplicationsModalsStore, TApplicationsModalsAction } from './types';

export enum ApplicationsModalsActionsEnum {
  SHOW_CREATE_TOPIC = 'SHOW_CREATE_TOPIC',
}

export const applicationsModalsInitialState: IApplicationsModalsStore = {
  createTopic: {
    open: false,
    hide: false,
    application: null,
  },
};

export const applicationsModalsReducer = (
  state = applicationsModalsInitialState,
  action: TApplicationsModalsAction
): IApplicationsModalsStore => {
  switch (action.type) {
    case ApplicationsModalsActionsEnum.SHOW_CREATE_TOPIC:
      return { ...state, createTopic: action.payload };
  }
};
