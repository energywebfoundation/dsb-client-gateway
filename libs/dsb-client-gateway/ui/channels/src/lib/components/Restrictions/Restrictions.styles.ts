import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  text: {
    fontSize: 14,
    lineHeight: '17px',
    fontWeight: 400,
    color: theme.palette.grey[200],
  },
  chip: {
    background: theme.palette.primary.main,
    height: 20,
    borderRadius: 21,
  },
  chipLabel: {
    fontSize: 12,
    lineHeight: '18px',
    fontWeight: 600,
    letterSpacing: '0.4px',
    color: '#fff',
    fontFamily: theme.typography.body2.fontFamily,
  },
}));
