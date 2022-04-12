import { useState } from 'react';
import Head from 'next/head';
import { makeStyles } from 'tss-react/mui';
import { Container } from '@mui/material';
import { TopicsList, TopicDialog } from '@dsb-client-gateway/ui/topics';

export default function Topics() {
  const { classes } = useStyles();
  const [dialogOpen, setDialogOpen] = useState(true);

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

  const handleUpdateTopic = async () => {
    console.log('update');
  };

  const handlePostTopic = async () => {
    console.log('update');
  };

  return (
    <div>
      <Head>
        <title>EW-DSB Client Gateway - Topic List</title>
        <meta name="description" content="EW-DSB Client Gateway" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <TopicDialog open={dialogOpen} handleClose={() => setDialogOpen(false)} />
        <Container maxWidth="lg">
          <section className={classes.table}>
            {topics ? (
              <TopicsList
                applicationName={applicationName}
                topics={topics}
                handleUpdateTopic={handleUpdateTopic}
                handlePostTopic={handlePostTopic}
              />
            ) : null}
          </section>
        </Container>
      </main>
    </div>
  );
}

const useStyles = makeStyles()((theme) => ({
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',

    '& *': {
      color: '#fff',
    },
  },
  searchText: {
    display: 'flex',
    paddingTop: '1rem',
    alignItems: 'center',
    'font-size': '8 px',
    '& *': {
      color: '#6E6B7B',
    },
  },
  connectionStatusPaper: {
    padding: '.5rem 1rem',
    marginLeft: '1rem',
    background: theme.palette.secondary.main,
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    color: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  div: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  divider: {
    background: '#1E263C',
    margin: '3rem 0',
  },
  main: {
    padding: '0 2rem',
  },
  textWhite: {
    color: '#fff',
  },
  table: {
    marginTop: '1rem',
  },
  navLink: {
    fontSize: '1rem',

    '&:hover': {
      textDecorationLine: 'underline',
      color: theme.palette.secondary.main,
    },
  },
  active: {
    color: theme.palette.secondary.main,
  },
}));
