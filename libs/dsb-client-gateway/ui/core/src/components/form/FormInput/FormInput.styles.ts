import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  root: {
    margin: 0,
    background: 'rgba(22, 29, 49, 0.45)',
    borderRadius: 5,
    '& .MuiInputBase-root': {
      fontFamily: theme.typography.body2.fontFamily,
      fontSize: 12,
      lineHeight: '24px',
      fontWeight: 400,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #848484',
      borderRadius: 5
    },
    '& input': {
      padding: '8px 10px 8px 15px',
      fontSize: 12,
      color: '#fff',
      minHeight: 22,
      fontFamily: theme.typography.body2.fontFamily,
      '&::placeholder': {
        fontSize: 12,
        lineHeight: '24px',
        fontWeight: 400,
        color: '#B9B9C3',
        opacity: 1
      },
    }
  },
  label: {
    fontSize: 12,
    lineHeight: '14px',
    fontWeight: 400,
    letterSpacing: '0.4px',
    color: theme.palette.common.white,
    fontFamily: theme.typography.body2.fontFamily,
    marginBottom: 10
  }
}));
