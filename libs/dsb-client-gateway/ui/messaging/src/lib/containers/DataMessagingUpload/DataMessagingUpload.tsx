import { FC } from 'react';
import { Box, Grid, Button, Typography, CircularProgress } from '@mui/material';
import { Autocomplete } from '@dsb-client-gateway/ui/core';
import { UploadForm } from '../UploadForm';
import { useDataMessagingUploadEffects } from './DataMessagingUpload.effects';
import { useStyles } from './DataMessagingUpload.styles';

export const DataMessagingUpload: FC = () => {
  const { classes, theme } = useStyles();
  const {
    channelOptions,
    channelsLoading,
    onChannelChange,
    onTopicChange,
    topicsFieldDisabled,
    topicsOptions,
    selectedTopic,
    selectedChannel,
    onFileChange,
    topicsById,
    submitHandler,
    isUploading,
    buttonDisabled,
  } = useDataMessagingUploadEffects();
  return (
    <Box className={classes.wrapper}>
      <Grid container>
        <Grid item xs={6}>
          <Autocomplete
            value={selectedChannel}
            loading={channelsLoading}
            options={channelOptions}
            label="Channel name"
            placeholder="Channel name"
            wrapperProps={{ flexGrow: 1, mr: 1.3 }}
            className={classes.field}
            onChange={onChannelChange}
          />
        </Grid>
        <Grid item xs={6}>
          <Autocomplete
            value={topicsById[selectedTopic]?.topicName}
            disabled={topicsFieldDisabled}
            options={topicsOptions}
            label="Topic name"
            placeholder="Topic name"
            wrapperProps={{ flexGrow: 1, ml: 1.3 }}
            className={classes.field}
            onChange={onTopicChange}
          />
        </Grid>
      </Grid>
      <UploadForm onFileChange={onFileChange} wrapperProps={{ mt: 3.8 }} />
      <Box display="flex" justifyContent="flex-end" mt={3.7}>
        <Button
          type="submit"
          variant="contained"
          disabled={buttonDisabled}
          className={classes.button}
          onClick={submitHandler}
        >
          {isUploading ? (
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress
                size={17}
                sx={{ color: theme.palette.common.white }}
              />
            </Box>
          ) : (
            <Typography className={classes.buttonText} variant="body2">
              Save
            </Typography>
          )}
        </Button>
      </Box>
    </Box>
  );
};
