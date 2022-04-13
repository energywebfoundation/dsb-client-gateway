import {
  useApplicationsModalsDispatch,
  ApplicationsModalsActionsEnum,
} from '../context';

export const useApplicationEffects = () => {
  const dispatch = useApplicationsModalsDispatch();

  const openCreateTopic = () => {
    dispatch({
      type: ApplicationsModalsActionsEnum.SHOW_CREATE_TOPIC,
      payload: {
        open: true,
        hide: false,
        application: null,
      },
    });
  };

  return {
    openCreateTopic,
  };
};
