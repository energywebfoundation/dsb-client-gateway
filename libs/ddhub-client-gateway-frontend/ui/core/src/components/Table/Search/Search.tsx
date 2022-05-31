import React, { memo } from 'react';
import {
  InputAdornment,
  TextField,
  Typography,
  Box,
  InputLabel,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useSearchEffects } from './Search.effects';
import { useStyles } from './Search.styles';

export interface SearchProps {
  filter: string;
  setFilter?: (value: string) => void; // either one is required, setFilter is default for frontend search
  onSearchInput?: (value: string) => void; // for backend search
  debounceTime?: number;
}

export const Search = memo((props: SearchProps) => {
  const { classes } = useStyles();
  const { field, handleReset, onFilterChange, inputProps, value } =
    useSearchEffects(props);

  return (
    <Box className={classes.wrapper}>
      <InputLabel>
        <Typography variant="body2" className={classes.label}>
          Search
        </Typography>
      </InputLabel>
      <TextField
        fullWidth
        type="text"
        margin="normal"
        variant="outlined"
        name={inputProps.name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onFilterChange(event.target.value);
          inputProps.onChange(event);
        }}
        inputRef={inputProps.ref}
        inputProps={{
          ...field.inputProps,
        }}
        classes={{
          root: classes.root,
        }}
        InputProps={{
          endAdornment: value && (
            <InputAdornment position="end">
              <Close className={classes.close} onClick={handleReset} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
});

Search.displayName = 'Search';
