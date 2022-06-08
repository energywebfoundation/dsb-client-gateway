import {
  ChannelControllerGetByTypeParams,
  GetChannelResponseDto,
  useChannelControllerGetByType,
} from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { keyBy } from 'lodash';
import { useCustomAlert } from '@ddhub-client-gateway-frontend/ui/core';

export const useChannels = (params?: ChannelControllerGetByTypeParams) => {
  const Swal = useCustomAlert();
  const { data, isLoading, isSuccess, isError } = useChannelControllerGetByType(
    params,
    {
      query: {
        onError: (err: { message: string }) => {
          console.error(err);
          Swal.error({ text: err?.message });
        },
      },
    }
  );

  const channels: GetChannelResponseDto[] = data ?? [];
  const channelsByName = keyBy(channels, 'fqcn');
  const channelsLoaded = data !== undefined && isSuccess && !isError;

  return {
    channels,
    isLoading,
    channelsLoaded,
    channelsByName,
  };
};
