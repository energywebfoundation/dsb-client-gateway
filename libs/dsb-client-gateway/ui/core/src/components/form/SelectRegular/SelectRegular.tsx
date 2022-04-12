import React, { FC } from 'react';
import { MenuItem, TextField, Box, InputLabel } from '@mui/material';
import { UseFormRegister, FieldValues } from 'react-hook-form';
import { ReactComponent as ArrowDownIcon } from './arrow-down.svg';
import { GenericFormField } from '../../../containers/GenericForm';
import { useStyles } from './SelectRegular.styles';

export interface SelectRegularProps {
  field: GenericFormField;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorExists?: boolean;
  errorText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  register?: UseFormRegister<FieldValues>;
  disabled?: boolean;
}

export const SelectRegular: FC<SelectRegularProps> = ({
  field,
  onChange,
  errorExists = false,
  errorText = '',
  variant = 'standard',
  value = '',
  disabled = false,
}) => {
  const { classes } = useStyles();
  const options = field.options || [];

  return (
    <Box {...field.formInputsWrapperProps} flexShrink={0}>
      <InputLabel className={classes.label}>{field.label ?? ''}</InputLabel>
      <TextField
        select
        fullWidth
        name={`${field.name}`}
        error={errorExists}
        helperText={errorText}
        margin="normal"
        variant={variant}
        value={value}
        defaultValue={value}
        onChange={onChange}
        disabled={disabled}
        required={field.required}
        inputProps={{
          ...field.inputProps,
        }}
        classes={{
          root: classes.root,
        }}
        SelectProps={{
          IconComponent: ArrowDownIcon,
          classes: {
            icon: classes.icon,
          },
        }}
        {...field.textFieldProps}
      >
        {options.map((option) => (
          <MenuItem
            key={option.label}
            value={option.value}
            className={classes.menuItem}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};
