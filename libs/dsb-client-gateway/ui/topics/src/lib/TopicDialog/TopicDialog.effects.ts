import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { FormSelectOption } from '@dsb-client-gateway/ui/core';
import { SendTopicBodyDto } from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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
      tags: yup.array().required(),
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

  const createTopicHandler: SubmitHandler<FieldValues> = (data) => {
    const values = data as SendTopicBodyDto;
    const formattedValues = {
      ...data,
      schemaType: schemaTypeOptions.find(
        (option) => option.value === values.schemaType
      )?.label,
    };
    console.log(formattedValues);
  };

  const onSubmit = handleSubmit(createTopicHandler);

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
