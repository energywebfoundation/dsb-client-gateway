import React from 'react';
import Head from 'next/head';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { makeStyles } from '@material-ui/styles'
import {
  Typography,
  Container,
  Divider,
  Theme,
  Grid,
  Link
} from '@material-ui/core'
import { config } from 'config';
import { getStorage } from 'services/storage.service';
import { GatewayIdentityContainer } from 'components/GatewayIdentity/GatewayIdentityContainer';
import { ProxyCertificateContainer } from 'components/ProxyCertificate/ProxyCertificateContainer';
import Header from 'components/Header/Header';
import { DsbApiService } from 'services/dsb-api.service';


// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const health = await DsbApiService.init().getHealth()
  const state = await getStorage()
  let result;

  console.log('health', health, 'state', state)
  const auth: string = context.req.headers.authorization as string;

  if (!config.authentication.username && !config.authentication.password) {
    result = {
      baseUrl: config.dsb.baseUrl,
      health: health,
      state: state,
      auth: auth
    }
  } else if (!auth) {
    context.res.setHeader("WWW-Authenticate", "Basic realm=\"Authorization Required\"")
    context.res.statusCode = 401
    context.res.statusMessage = 'Authentication Required!'
    result = {
      baseUrl: config.dsb.baseUrl,
      health: health,
      state: state,
      errorCode: '401'
    }
  } else {
    const token: string = auth.split(" ").pop() as string;
    const credentials = Buffer.from(token, "base64").toString("ascii").split(":");
    if (credentials[0] === config.authentication.username && credentials[1] === config.authentication.password) {
      result = {
        baseUrl: config.dsb.baseUrl,
        health: health,
        state: state,
        auth: auth
      }
    } else {
      // The user typed in the username or password wrong.
      context.res.statusMessage = "Access Denied (incorrect credentials)"
      context.res.statusCode = 401;
      result = {
        baseUrl: config.dsb.baseUrl,
        health: health,
        state: state,
        errorCode: '401',
        auth: auth
      }
    }
  }
  return {
    props: result
  }
}


// TODO: break into components
export default function Home({ baseUrl, health, state, errorCode, auth }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const classes = useStyles()

  if (errorCode) {
    return <div></div>
  }
  return (
    <div>
      <Head>
        <title>EW-DSB Client Gateway</title>
        <meta name="description" content="EW-DSB Client Gateway" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />

        <Container maxWidth="md">
          <section className={classes.connectionStatus}>
            <Typography variant="h4">Connection Status </Typography>
            <Typography variant="caption" className={classes.connectionStatusPaper}>
              {health.ok ? 'ONLINE' : `ERROR [${health.err}]`}
            </Typography>
          </section>

          <Divider className={classes.divider} />

          <section className={classes.swagger}>
            <Link href="/docs">
              API Documentation
            </Link>
          </section>

          <Divider className={classes.divider} />

          <section className={classes.main}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GatewayIdentityContainer identity={state.some?.identity} auth = {auth} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ProxyCertificateContainer certificate={state.some?.certificate} auth = {auth}  />
              </Grid>
            </Grid>
          </section>
        </Container>
      </main>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',

    '& *': {
      color: '#fff'
    },
    marginBottom: '2rem'
  },
  connectionStatusPaper: {
    padding: '.5rem 1rem',
    marginLeft: '1rem',
    background: theme.palette.secondary.main,
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  divider: {
    background: '#fff'
  },
  swagger: {
    margin: '2rem 0',
    padding: '0 2rem',

    '& a': {
      color: '#fff',
      fontSize: '2.1rem',
      textDecoration: 'underline'
    }
  },
  main: {
    padding: '0 1rem',
    marginTop: '2rem'
  }
}))
