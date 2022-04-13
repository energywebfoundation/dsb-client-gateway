import { FC } from 'react';
import { Typography, Button } from '@mui/material';
import { TopicsList } from '../TopicsList';
import { useApplicationEffects } from './Application.effects';
import { useStyles } from './Application.styles';

export const Application: FC = () => {
  const { classes } = useStyles();
  const { openCreateTopic } = useApplicationEffects();

  // TODO: remove mocks
  const applicationName = 'applicationName';
  const topics = [
    {
      id: '1',
      name: 'Topic',
      owner: 'iam',
      schema: 'schema',
      schemaType: 'schema type',
      version: '1.0.0',
    },
  ];

  return (
    <section className={classes.table}>
      {topics ? (
        <TopicsList applicationName={applicationName} topics={topics} />
      ) : null}
      <div className={classes.createTopicButtonWrapper}>
        <section className={classes.searchText}>
          <Button
            className={classes.createTopicButton}
            variant="contained"
            color="primary"
            onClick={openCreateTopic}
          >
            <Typography
              variant="body2"
              className={classes.createTopicButtonText}
            >
              Create
            </Typography>
          </Button>
        </section>
      </div>
    </section>
  );
};
