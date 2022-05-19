import {
  CreateButton,
  GenericTable,
} from '@ddhub-client-gateway-frontend/ui/core';
import { useChannelListEffects } from './ChannelList.effects';
import { CHANNELS_HEADERS } from '../../models';

export function ChannelList() {
  const { channels, onCreateHandler, actions, channelsLoaded } =
    useChannelListEffects();

  return (
    <div>
      <GenericTable
        headers={CHANNELS_HEADERS}
        tableRows={channels}
        actions={actions}
        loading={!channelsLoaded}
      >
        <CreateButton onCreate={onCreateHandler} />
      </GenericTable>
    </div>
  );
}
