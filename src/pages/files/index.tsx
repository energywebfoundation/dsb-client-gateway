import { useEffect } from 'react'
import Head from 'next/head'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { makeStyles } from '@material-ui/styles'
import { Typography, Container, Divider, Theme } from '@material-ui/core'
import swal from '@sweetalert/with-react'
import { UploadContainer } from '../../components/UploadFile/UploadContainer'
import Header from '../../components/Header/Header'
import { DownloadContainer } from '../../components/DownloadFile/DownloadContainer'
import { DsbApiService } from '../../services/dsb-api.service'
import { isAuthorized } from '../../services/auth.service'
import { ErrorCode, Result, serializeError, Channel, ErrorBodySerialized } from '../../utils'

type Props = {
  health: Result<boolean, ErrorBodySerialized>
  channels: Result<Channel[], ErrorBodySerialized>
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<{
  props: Props
}> {
  const authHeader = context.req.headers.authorization
  const { err } = isAuthorized(authHeader)
  if (!err) {
    const health = await DsbApiService.init().getHealth()
    const channels = await DsbApiService.init().getChannels()
    return {
      props: {
        health: serializeError(health),
        channels: serializeError(channels)
      }
    }
  } else {
    if (err.message === ErrorCode.UNAUTHORIZED) {
      context.res.statusCode = 401
      context.res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"')
    } else {
      context.res.statusCode = 403
    }
    return {
      props: {
        health: {},
        channels: {}
      }
    }
  }
}

export default function FileUpload({ health, channels }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const classes = useStyles()

  useEffect(() => {
    if (health.err) {
      return swal('Error', health.err.reason, 'error')
    }
    if (channels.err) {
      return swal('Error', channels.err.reason, 'error')
    }
  }, [health, channels])

  return (
    <div>
      <Head>
        <title>EW-DSB Client Gateway - File Upload / Download</title>
        <meta name="description" content="EW-DSB Client Gateway" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />

        <Container maxWidth="lg">
          <section className={classes.connectionStatus}>
            <Typography variant="h4">Connection Status </Typography>
            <Typography variant="caption" className={classes.connectionStatusPaper}>
              {health.ok ? 'ONLINE' : `ERROR [${health.err?.code}]`}
            </Typography>
          </section>

          <Divider className={classes.divider} />

          <section className={classes.main}>
            <Typography className={classes.textWhite} variant="h4">
              File Upload{' '}
            </Typography>
            <UploadContainer channels={channels.ok} />
          </section>

          <Divider className={classes.divider} />

          <section className={classes.main}>
            <Typography className={classes.textWhite} variant="h4">
              File Download{' '}
            </Typography>
            <DownloadContainer channels={channels.ok} />
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
    padding: '0 2rem',

    '& *': {
      color: '#fff'
    }
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
    background: '#fff',
    margin: '3rem 0'
  },
  main: {
    padding: '0 2rem'
  },
  textWhite: {
    color: '#fff'
  }
}))
