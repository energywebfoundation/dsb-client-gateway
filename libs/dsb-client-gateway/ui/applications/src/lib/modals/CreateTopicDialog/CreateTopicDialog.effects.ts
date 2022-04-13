import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import Swal from 'sweetalert2'
import { FormSelectOption } from '@dsb-client-gateway/ui/core';
import { SendTopicBodyDto, useTopicsControllerPostTopics } from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  useApplicationsModalsStore,
  useApplicationsModalsDispatch,
  ApplicationsModalsActionsEnum,
} from '../../context';


const useCreateTopic = () => {
  const { mutate } = useTopicsControllerPostTopics({
    mutation: {
      onError: (error) => {
        console.log(error);
        return Swal.fire('Error', 'Please enter channel name', 'error')
      }
    }
  });

  const createTopicHandler = (values: SendTopicBodyDto) => {
    mutate({
      data: values
    })
  }

  return {
    createTopicHandler
  }
}

export const useCreateTopicDialogEffects = () => {
  const initialValues: SendTopicBodyDto = {
    schema: '',
    tags: [],
    version: '',
  };

  const schema = yup
    .object({
      name: yup.string().required(),
      schema: yup.string().required(),
      schemaType: yup.string().required(),
      tags: yup.array().min(1).required(),
      version: yup
        .string()
        .required()
        .matches(
          // regex from backend
          /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/
        ),
    })
    .required();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<FieldValues>({
    defaultValues: initialValues,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const { createTopicHandler } = useCreateTopic();
  const {
    createTopic: { open },
  } = useApplicationsModalsStore();
  const dispatch = useApplicationsModalsDispatch();

  const closeModal = () => {
    dispatch({
      type: ApplicationsModalsActionsEnum.SHOW_CREATE_TOPIC,
      payload: {
        open: false,
        hide: false,
        application: null,
      },
    });
  };

  const schemaTypeOptions: FormSelectOption[] = [
    { value: 'json', label: 'JSD7' },
    { value: 'xml', label: 'XML' },
    { value: 'csv', label: 'CSV' },
    { value: 'tsv', label: 'TSV' },
  ];

  const fields = {
    topicName: {
      name: 'name',
      label: 'Topic name',
      formInputsWrapperProps: {
        width: 254,
        marginRight: '15px',
      },
      inputProps: {
        placeholder: 'Topic name',
      },
    },
    version: {
      name: 'version',
      label: 'Version',
      formInputsWrapperProps: {
        width: 145,
      },
      inputProps: {
        placeholder: 'Version',
      },
    },
    tags: {
      name: 'tags',
      label: 'Tags',
      options: [] as FormSelectOption[],
      autocomplete: true,
      maxValues: 20,
      multiple: true,
      tags: true,
      inputProps: {
        placeholder: 'Tags',
      },
    },
    schemaType: {
      name: 'schemaType',
      label: 'Schema type',
      options: schemaTypeOptions,
      inputProps: {
        placeholder: 'Schema type',
      },
    },
    schema: {
      name: 'schema',
      label: 'Schema',
      inputProps: {
        placeholder: 'Schema',
      },
    },
  };

  const topicSubmitHandler: SubmitHandler<FieldValues> = (data) => {
    const values = data as SendTopicBodyDto;
    console.log(values);
    createTopicHandler(values as SendTopicBodyDto);
  };

  const onSubmit = handleSubmit(topicSubmitHandler);

  const schemaTypeValue = watch('schemaType');
  const buttonDisabled = !isValid;

  return {
    open,
    closeModal,
    fields,
    register,
    control,
    onSubmit,
    buttonDisabled,
    schemaTypeValue,
  };
};
