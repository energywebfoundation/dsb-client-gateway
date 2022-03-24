import { useEffect } from 'react'
import Head from 'next/head'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { NavigateNext } from '@mui/icons-material'
import { Home as HomeIcon } from 'react-feather'
import { ErrorBodySerialized, ErrorCode, Option, Result, serializeError, Storage } from '../utils'
import Swal from 'sweetalert2'
import { makeStyles } from 'tss-react/mui';
import { Container, Breadcrumbs, Grid, Typography } from '@mui/material';
import { GatewayIdentityContainer } from '../components/GatewayIdentity/GatewayIdentityContainer';
import { ProxyCertificateContainer } from '../components/ProxyCertificate/ProxyCertificateContainer';
import { DsbApiService } from '../services/dsb-api.service';
import { refreshState } from '../services/identity.service';
import { isAuthorized } from '../services/auth.service';

type Props = {
  health: Result<boolean, ErrorBodySerialized>
  state: Result<Storage, ErrorBodySerialized>
  auth: Option<string>
}
export async function getServerSideProps(context: GetServerSidePropsContext): Promise<{
  props: Props
}> {
  const authHeader = context.req.headers.authorization;
  const { err } = isAuthorized(authHeader);
  if (!err) {
    const health = await DsbApiService.init().getHealth()
    const state = await refreshState()
    return {
      props: {
        health: serializeError(health),
        state: serializeError(state), // todo: remove private data
        auth: authHeader ? { some: authHeader } : { none: true }
      }
    }
  } else {
    if (err.message === ErrorCode.UNAUTHORIZED || err.message === ErrorCode.FORBIDDEN) {
      context.res.statusCode = 401
      context.res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"')
    }
    return {
      props: {
        health: {},
        state: {},
        auth: { none: true }
      }
    }
  }
}
export default function Index({ health, state, auth }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { classes } = useStyles()
  useEffect(() => {
    if (health.err) {
      Swal.fire('Error', health.err.reason, 'error')
    }
  }, [health, state])
  return (
    <div>
      <Head>
        <title>EW-DSB Client Gateway</title>
        <meta name="description" content="EW-DSB Client Gateway"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <main>
        <Container maxWidth="lg">
          <section className={classes.connectionStatus}>
            <Typography variant="h5" className={classes.pageTitle}>Gateway Settings</Typography>
            <Typography variant="h5">|</Typography>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className={classes.breadCrumbs}>
              <HomeIcon color='#A466FF' size={15} />
              <Typography color="primary">Gateway Settings</Typography>
            </Breadcrumbs>
          </section>

          {state.ok && (
            <section className={classes.main}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GatewayIdentityContainer
                    identity={state.ok?.identity}
                    enrolment={state.ok?.enrolment}
                    auth={auth.some}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ProxyCertificateContainer certificate={state.ok?.certificate} auth={auth.some} />
                </Grid>
              </Grid>
            </section>
          )}
        </Container>
      </main>
    </div>
  )
}
const useStyles = makeStyles()(theme => ({
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
    marginRight: '1rem',
    background: theme.palette.primary.main,
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  divider: {
    background: '#1E263C'
  },
  main: {
    padding: '0 1rem',
    marginTop: '2rem'
  },

  pageTitle: {
    marginRight: '1rem',
    fontSize: '24px'
  },

  breadCrumbs: {
    marginLeft: '1rem',
  }

}))
