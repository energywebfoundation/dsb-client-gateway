import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import Swal from 'sweetalert2'
import { FormSelectOption } from '@dsb-client-gateway/ui/core';
import { SendTopicBodyDto, useTopicsControllerPostTopics } from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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

export const useTopicDialogEffects = () => {
  const initialValues = {
    name: '',
    // TODO: remove and set owner
    owner: 'aemo',
    schema: '',
    schemaType: '',
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
      options: [],
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
    const formattedValues = {
      ...data,
      schemaType: schemaTypeOptions.find(
        (option) => option.value === values.schemaType
      )?.label,
    };
    console.log(formattedValues);
    createTopicHandler(formattedValues as SendTopicBodyDto);
  };

  const onSubmit = handleSubmit(topicSubmitHandler);

  const schemaTypeValue = watch('schemaType');
  const buttonDisabled = !isValid;

  return {
    fields,
    register,
    control,
    onSubmit,
    buttonDisabled,
    schemaTypeValue,
  };
};
