import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { useStyles } from './Restrictions.styles';
import { Collapse, Chip } from '@mui/material';
import { useRestrictionsEffects } from './Restrictions.effects';
import { didFormatMinifier } from '@ddhub-client-gateway-frontend/ui/utils';

export interface RestrictionsProps {
  value: string[];
  type: string;
}

export const Restrictions: FC<RestrictionsProps> = ({ value, type }) => {
  const { classes } = useStyles();
  const { isOpen, handleOpening } = useRestrictionsEffects();
  let formattedValue;

  if (value?.length) {
    formattedValue = (type === 'DID') ? value.map(item => didFormatMinifier(item)) : value;
  }

  return (
    <Box>
      {(!isOpen ?
        (<Typography variant="body2" className={classes.text} sx={{ display: 'inline', marginRight: '8px' }}>
        { value?.length ? formattedValue.slice(0,3).join(', ') : '--' }</Typography>)
        : (<Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Typography variant="body2" className={classes.text}>{formattedValue.join(', ')}</Typography></Collapse>)
      )}

      {(!isOpen && value?.length > 3) ? <Chip label={`+${value.length - 3}`} onClick={handleOpening} className={classes.chip} classes={{label: classes.chipLabel}}/> : ''}
    </Box>
  );
};
