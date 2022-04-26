import { useTopicVersion } from '@dsb-client-gateway/ui/api-hooks';
import {
  useTopicsModalsStore,
  useTopicsModalsDispatch,
  TopicsModalsActionsEnum,
} from '../../../context';
import { downloadJson, fields } from './ViewTopicDetails.utils';

export const useViewTopicDetailsEffects = () => {
  const {
    topicDetails: { open, topic, application },
  } = useTopicsModalsStore();
  const dispatch = useTopicsModalsDispatch();

  const { topic: topicWithSchema, isLoading } = useTopicVersion(
    topic?.id,
    topic?.version
  );

  const closeModal = () => {
    dispatch({
      type: TopicsModalsActionsEnum.SHOW_TOPIC_DETAILS,
      payload: {
        open: false,
        topic: null,
        application: null,
      },
    });
  };

  const openUpdateTopic = () => {
    closeModal();
    dispatch({
      type: TopicsModalsActionsEnum.SHOW_UPDATE_TOPIC,
      payload: {
        open: true,
        hide: false,
        application,
        topic,
      },
    });
  };

  const exportSchema = () => {
    downloadJson(
      topicWithSchema.schema,
      `Schema_${topicWithSchema.name}_${topicWithSchema.version}.json`
    );
  };

  return {
    open,
    closeModal,
    isLoading,
    application,
    openUpdateTopic,
    topic: topicWithSchema,
    exportSchema,
    fields
  };
};