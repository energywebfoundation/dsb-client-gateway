import {
  PostTopicDto,
  useTopicsControllerGetTopicHistoryByIdAndVersion,
} from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { useCustomAlert } from '@ddhub-client-gateway-frontend/ui/core';

export const useTopicVersion = (id: string, version: string) => {
  const Swal = useCustomAlert();
  const { data, isLoading, isSuccess, isError, remove } =
    useTopicsControllerGetTopicHistoryByIdAndVersion(id, version, {
      query: {
        enabled: id !== undefined && version !== undefined,
        onError: (err: { message: string }) => {
          console.error(err);
          Swal.error({ text: err?.message });
        },
      },
    });
  const topic = data ?? ({} as PostTopicDto);
  const topicLoaded = isSuccess && data !== undefined && !isError;

  return {
    topic,
    isLoading,
    isSuccess,
    topicLoaded,
    remove,
  };
};
