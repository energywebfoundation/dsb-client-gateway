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
} from '@mui/material';
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Controller,
} from 'react-hook-form';
import Editor, { useMonaco } from '@monaco-editor/react';
import {
  CloseButton,
  FormInput,
  FormSelect,
  GenericFormField,
} from '@dsb-client-gateway/ui/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useStyles } from './TopicDialog.styles';
import { getTopicsControllerGetTopicsMock } from '@dsb-client-gateway/dsb-client-gateway-api-client';

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
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  // const monaco = useMonaco();

  const topics = getTopicsControllerGetTopicsMock();
  console.log(topics, 'topics');

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    setIsEditorReady(true);
    monacoRef.current = editor;
    console.log(editor);
      editor.onDidBlurEditorWidget(() => {
        console.log('blur', editor.getValue());
        if (!editor.getValue()) {
          setShowPlaceholder(true);
        }
      });
  }

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

  const schemaField: GenericFormField = {
    name: 'schema',
    label: 'Schema',
    inputProps: {
      placeholder: 'Schema',
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
              <Box mb={2.7} height={132} sx={{ position: 'relative' }}>
                {showPlaceholder && (
                  <Box
                    className={classes.placeholderWrapper}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      zIndex: 1
                    }}
                    onClick={() => {
                      setShowPlaceholder(false);
                      console.log('click', monacoRef.current);
                      monacoRef.current && monacoRef.current?.layout();
                      monacoRef.current && monacoRef.current?.focus();
                    }}
                  >
                    <Typography className={classes.placeholder}>
                      Schema
                    </Typography>
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
                    key={`${schemaField.name}`}
                    name={schemaField.name}
                    control={control}
                    render={({ field: { value, onChange } }) => {

                      return (
                        <Editor
                          height="calc(100% - 19px)"
                          theme="vs-dark"
                          language={formValues['schemaType']}
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
