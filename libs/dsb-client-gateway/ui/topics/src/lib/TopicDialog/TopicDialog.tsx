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
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import {
  CloseButton,
  FormInput,
  FormSelect,
  GenericFormField,
} from '@dsb-client-gateway/ui/core';
import { useStyles } from './TopicDialog.styles';

interface TopicDialogProps {
  open: boolean;
  title?: string;
  handleClose: () => void;
  closeButton?: boolean;
}

export const TopicDialog: FC<TopicDialogProps> = ({ open, handleClose }) => {
  const { classes } = useStyles();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>();

  const formValues = watch();

  const topicField: GenericFormField = {
    name: 'topicName',
    label: 'Topic name',
    formInputsWrapperProps: {
      width: 254,
      marginRight: '15px',
    },
    inputProps: {
      placeholder: 'Topic name',
    },
  };

  const versionField: GenericFormField = {
    name: 'version',
    label: 'Version',
    formInputsWrapperProps: {
      width: 145,
    },
    inputProps: {
      placeholder: 'Version',
    },
  };

  const tagsField: GenericFormField = {
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
  };

  const schemaTypeField: GenericFormField = {
    name: 'schemaType',
    label: 'Schema type',
    options: [
      { value: 'json', label: 'JSD7' },
      { value: 'xml', label: 'XML' },
      { value: 'csv', label: 'CSV' },
      { value: 'tsv', label: 'TSV' },
    ],
    inputProps: {
      placeholder: 'Schema type',
    },
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => console.log(data);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      classes={{ paper: classes.paper }}
    >
      <DialogTitle className={classes.title}>Create topic</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ padding: 0 }}>
          <DialogContentText className={classes.subTitle}>
            Provide topic data with this form
          </DialogContentText>
          <Grid container mt={4}>
            <Grid item xs={4}></Grid>
            <Grid item xs={8} pl={5}>
              <Box display="flex" mb={2.7}>
                <FormInput
                  field={topicField}
                  register={register}
                  variant="outlined"
                />
                <FormInput
                  field={versionField}
                  register={register}
                  variant="outlined"
                />
              </Box>
              <Box mb={2.7}>
                <FormSelect
                  field={tagsField}
                  register={register}
                  control={control}
                  variant="outlined"
                />
              </Box>
              <Box mb={2.7}>
                <FormSelect
                  field={schemaTypeField}
                  register={register}
                  control={control}
                  variant="outlined"
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
          <Button variant="contained" type="submit" className={classes.button}>
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
