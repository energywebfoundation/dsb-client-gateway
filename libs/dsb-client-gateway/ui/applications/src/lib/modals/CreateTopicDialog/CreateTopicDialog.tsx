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
import { useStyles } from './CreateTopicDialog.styles';
import { useCreateTopicDialogEffects } from './CreateTopicDialog.effects';

export const CreateTopicDialog: FC = () => {
  const { classes } = useStyles();
  const {
    open,
    closeModal,
    fields,
    register,
    control,
    onSubmit,
    buttonDisabled,
    schemaTypeValue,
  } = useCreateTopicDialogEffects();

  return (
    <Dialog
      open={open}
      onClose={closeModal}
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
            onClick={closeModal}
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
            <CloseButton onClose={closeModal} />
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};
