import { useAsyncDebounce } from 'react-table';
import { useForm, FieldValues } from 'react-hook-form';
import { SearchProps } from './Search';

export const useSearchEffects = ({
  setFilter,
  filter,
  debounceTime = 300,
  onSearchInput
}: SearchProps) => {
  const onFilterChange = useAsyncDebounce((value: string) => {
    if (setFilter) {
      setFilter(value || '');
    } else if (onSearchInput) {
      onSearchInput(value || '');
    }
  }, debounceTime);

  const { register, reset, watch } = useForm<FieldValues>({
    mode: 'onChange',
    defaultValues: { search: filter },
  });

  const field = {
    name: 'search',
    inputProps: {
      placeholder: 'Search',
    },
  };

  const inputProps = register(field.name);
  const value = watch(field.name);

  const handleReset = () => {
    onFilterChange('');
    reset({ search: '' });
  };

  return {
    field,
    handleReset,
    onFilterChange,
    inputProps,
    value,
  };
};
