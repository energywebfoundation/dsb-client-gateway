import { useState } from 'react';
import { useQueryClient } from 'react-query';
import {
  CreateChannelDto,
  CreateChannelDtoType,
  getChannelControllerGetByTypeQueryKey,
} from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { useCustomAlert } from '@dsb-client-gateway/ui/core';
import {
  ModalActionsEnum,
  useModalDispatch,
  useModalStore,
} from '../../../context';
import { useCreateChannel } from '@dsb-client-gateway/ui/api-hooks';
import { ChannelTopic } from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { Topic } from './Topics/Topics.effects';
import { ICreateChannel } from '../models/create-channel.interface';
import { ChannelType } from '../../../models/channel-type.enum';
import { ConnectionType } from './Details/models/connection-type.enum';

const initialState = {
  fqcn: '',
  type: CreateChannelDtoType.sub,
  conditions: {
    roles: [] as string[],
    dids: [] as string[],
    topics: [] as ChannelTopic[],
  },
  channelType: '',
  connectionType: '',
};

export const useCreateChannelEffects = () => {
  const queryClient = useQueryClient();
  const {
    create: { open },
  } = useModalStore();
  const dispatch = useModalDispatch();
  const Swal = useCustomAlert();
  const [activeStep, setActiveStep] = useState(0);

  const [channelValues, setChannelValues] =
    useState<ICreateChannel>(initialState);

  const resetToInitialState = () => {
    setChannelValues(initialState);
    setActiveStep(0);
  };

  const getType = ({
    connectionType,
    channelType,
  }: {
    connectionType: ConnectionType;
    channelType: ChannelType;
  }): CreateChannelDtoType => {
    if (
      connectionType === ConnectionType.Subscribe &&
      channelType === ChannelType.Messaging
    ) {
      return CreateChannelDtoType.sub;
    }
    if (
      connectionType === ConnectionType.Publish &&
      channelType === ChannelType.Messaging
    ) {
      return CreateChannelDtoType.pub;
    }
    if (
      connectionType === ConnectionType.Subscribe &&
      channelType === ChannelType.FileTransfer
    ) {
      return CreateChannelDtoType.download;
    }

    return CreateChannelDtoType.upload;
  };

  const setDetails = (data: {
    fqcn: string;
    connectionType: ConnectionType;
    channelType: ChannelType;
  }) => {
    setActiveStep(activeStep + 1);
    setChannelValues({
      ...channelValues,
      ...data,
      type: getType(data),
    });
  };

  const setTopics = (data: Topic[]) => {
    setActiveStep(activeStep + 1);
    setChannelValues({
      ...channelValues,
      conditions: {
        ...channelValues.conditions,
        topics: data,
      },
    });
  };

  const setRestrictions = (data: { dids: string[]; roles: string[] }) => {
    setActiveStep(activeStep + 1);
    setChannelValues({
      ...channelValues,
      conditions: {
        ...channelValues.conditions,
        ...data,
      },
    });
  };

  const { createChannelHandler, isLoading: isCreating } = useCreateChannel();

  const closeModal = () => {
    dispatch({
      type: ModalActionsEnum.SHOW_CREATE,
      payload: {
        open: false,
      },
    });
    resetToInitialState();
  };

  const hideModal = () => {
    dispatch({
      type: ModalActionsEnum.HIDE_CREATE,
      payload: true,
    });
    resetToInitialState();
  };

  const showModal = () => {
    dispatch({
      type: ModalActionsEnum.HIDE_CREATE,
      payload: false,
    });
  };

  const onCreate = () => {
    queryClient.invalidateQueries(getChannelControllerGetByTypeQueryKey());
    closeModal();
    Swal.success({
      text: 'You have successfully created the channel',
    });
  };

  const onCreateError = () => {
    Swal.error({
      text: 'Error while creating channel',
    });
  };

  const channelSubmitHandler = () => {
    const values = channelValues;
    const channelCreateValues: CreateChannelDto = {
      fqcn: values.fqcn,
      type: values.type,
      conditions: values.conditions,
    };
    createChannelHandler(channelCreateValues, onCreate, onCreateError);
  };

  const openCancelModal = async () => {
    hideModal();
    const result = await Swal.warning({
      text: 'you will close create channel form',
    });

    if (result.isConfirmed) {
      closeModal();
    } else {
      showModal();
    }
  };

  const goBack = () => {
    setActiveStep(activeStep - 1);
  };

  return {
    open,
    closeModal,
    openCancelModal,
    isCreating,
    activeStep,
    setDetails,
    setTopics,
    channelSubmitHandler,
    setRestrictions,
    channelValues,
    goBack,
  };
};
