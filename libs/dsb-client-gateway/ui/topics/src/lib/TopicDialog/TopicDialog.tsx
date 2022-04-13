import { FC, useState, useRef } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import {
  CloseButton,
  FormInput,
  FormSelect,
} from '@dsb-client-gateway/ui/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
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

  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isSchemaValid, setSchemaValid] = useState(false);

  const handleEditorValidation = (markers: monaco.editor.IMarker[]) => {
    setSchemaValid(markers.length === 0);
  };

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    setIsEditorReady(true);
    monacoRef.current = editor;
    editor.onDidBlurEditorWidget(() => {
      if (!editor.getValue()) {
        setShowPlaceholder(true);
      }
    });
  };

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
            <Grid item xs={4}></Grid>
            <Grid item xs={8} pl={5}>
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
              <Box mb={2.7} height={132} sx={{ position: 'relative' }}>
                {showPlaceholder && (
                  <Box
                    className={classes.placeholderWrapper}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      zIndex: 1,
                    }}
                    onClick={() => {
                      if (!isEditorReady) return;

                      setShowPlaceholder(false);
                      monacoRef.current && monacoRef.current?.layout();
                      monacoRef.current && monacoRef.current?.focus();
                    }}
                  >
                    <Typography className={classes.placeholder}>
                      {isEditorReady && 'Schema'}
                    </Typography>
                    {!isEditorReady && (
                      <CircularProgress
                        style={{ width: '25px', height: '25px' }}
                      />
                    )}
                  </Box>
                )}

                <Box
                  className={classes.placeholderWrapper}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                  }}
                >
                  <Controller
                    key={`${fields.schema.name}`}
                    name={fields.schema.name}
                    control={control}
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Editor
                          height="calc(100% - 19px)"
                          theme="vs-dark"
                          language={schemaTypeValue}
                          options={{
                            minimap: {
                              enabled: false,
                            },
                            scrollbar: {
                              vertical: 'auto',
                            },
                            automaticLayout: true,
                            wordBasedSuggestions: false,
                            quickSuggestions: false,
                            snippetSuggestions: 'none',
                            autoClosingBrackets: 'always',
                            autoClosingQuotes: 'always',
                            formatOnPaste: true,
                            formatOnType: true,
                            scrollBeyondLastLine: true,
                            fontSize: 10,
                            lineNumbersMinChars: 3,
                            lineDecorationsWidth: 3,
                            suggestOnTriggerCharacters: false,
                          }}
                          onChange={(value: string | undefined) => {
                            onChange(value);
                          }}
                          value={value}
                          onMount={handleEditorDidMount}
                          onValidate={handleEditorValidation}
                        />
                      );
                    }}
                  />
                </Box>
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
