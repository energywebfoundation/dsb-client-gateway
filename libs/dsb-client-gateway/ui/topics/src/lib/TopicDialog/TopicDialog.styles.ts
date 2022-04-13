import { makeStyles } from 'tss-react/mui';
import { alpha } from '@mui/material/styles';

export const useStyles = makeStyles()((theme) => ({
  paper: {
    maxWidth: 756,
    minHeight: 633,
    padding: '37px 43px 32px 32px'
  },
  title: {
    fontSize: 23,
    lineHeight: '34px',
    fontWeight: 400,
    fontFamily: theme.typography.body1.fontFamily,
    color: theme.palette.common.white,
    padding: 0,
    marginBottom: 8,
    textAlign: 'center'
  },
  subTitle: {
    fontSize: 14,
    lineHeight: '21px',
    fontWeight: 400,
    textAlign: 'center',
    color: theme.palette.grey[400],
    fontFamily: theme.typography.body2.fontFamily,
  },
  closeButtonWrapper: {
    position: 'absolute',
    top: 17,
    right: 18
  },
  button: {
    padding: '10px 22px',
    borderRadius: 5
  },
  cancelButton: {
   border: `1px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
   marginRight: 7
  },
  cancelButtonText: {
    fontSize: 14,
    lineHeight: '17px',
    fontWeight: 400,
    color: theme.palette.secondary.main,
    textTransform: 'capitalize'
  },
  submitButtonText: {
    fontSize: 14,
    lineHeight: '17px',
    fontWeight: 400,
    color: theme.palette.common.white,
    textTransform: 'capitalize'
  },
  actions: {
    padding: 0
  },
  placeholderWrapper: {
    height: 132,
    background: '#1E1E1E',
    cursor: 'text',
    border: '1px solid #848484',
    boxSizing: 'border-box',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholder: {
    fontSize: 12,
    lineHeight: '24px',
    fontWeight: 400,
    color: theme.palette.grey[300],
    fontFamily: theme.typography.body2.fontFamily,
    position: 'absolute',
    top: 8,
    left: 15
  },
  loader: {

  }
}));
