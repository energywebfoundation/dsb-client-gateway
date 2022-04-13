import { FC } from 'react';
import clsx from 'clsx';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import {
  CloseButton,
  FormInput,
  FormSelect,
  Editor,
} from '@dsb-client-gateway/ui/core';
import { SendTopicBodyDto } from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { useStyles } from './TopicDialog.styles';
import { useTopicDialogEffects } from './TopicDialog.effects';

export type CreateTopicFormValues = SendTopicBodyDto;

interface TopicDialogProps {
  open: boolean;
  title?: string;
  handleClose: () => void;
  closeButton?: boolean;
}

export const TopicDialog: FC<TopicDialogProps> = ({ open, handleClose }) => {
  const { classes } = useStyles();
  const {
    fields,
    register,
    control,
    onSubmit,
    buttonDisabled,
    schemaTypeValue,
  } = useTopicDialogEffects();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      classes={{ paper: classes.paper }}
    >
      <DialogTitle className={classes.title}>Create topic</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ padding: 0 }}>
          <DialogContentText className={classes.subTitle}>
            Provide topic data with this form
          </DialogContentText>
          <Grid container mt={4}>
            <Grid item xs={4}>
              {/* TODO: remove mock */}
              <img
                className={classes.appImage}
                src="/appIcon.svg"
                alt="app icon"
              />
              <Box mt={2.5}>
                <Typography variant="body2" className={classes.label}>
                  Application name
                </Typography>
                <Typography variant="body2" className={classes.value}>
                  Application name 1
                </Typography>
              </Box>
              <Box mt={2.5}>
                <Typography variant="body2" className={classes.label}>
                  Namespace
                </Typography>
                <Typography variant="body2" className={classes.value}>
                  edge.apps.aemo.iam.ewc
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={8} pl={5} mt={1.7}>
              <Box display="flex" mb={2.7}>
                <FormInput
                  field={fields.topicName}
                  register={register}
                  variant="outlined"
                />
                <FormInput
                  field={fields.version}
                  register={register}
                  variant="outlined"
                />
              </Box>
              <Box mb={2.7}>
                <FormSelect
                  field={fields.tags}
                  register={register}
                  control={control}
                  variant="outlined"
                />
              </Box>
              <Box mb={2.7}>
                <FormSelect
                  field={fields.schemaType}
                  register={register}
                  control={control}
                  variant="outlined"
                />
              </Box>
              <Box mb={2.7}>
                <Editor
                  field={fields.schema}
                  register={register}
                  control={control}
                  language={schemaTypeValue}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button
            variant="outlined"
            onClick={handleClose}
            className={clsx(classes.button, classes.cancelButton)}
          >
            <Typography variant="body2" className={classes.cancelButtonText}>
              Cancel
            </Typography>
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={buttonDisabled}
            className={classes.button}
          >
            <Typography variant="body2" className={classes.submitButtonText}>
              Save
            </Typography>
          </Button>
          <Box className={classes.closeButtonWrapper}>
            <CloseButton onClose={handleClose} />
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};
