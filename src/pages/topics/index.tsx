import { useEffect } from 'react'
import Head from 'next/head'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { makeStyles } from '@material-ui/styles'
import { Typography, Container, Divider, Theme, TextField, IconButton, Button } from '@material-ui/core'
import { SearchOutlined, MoreVertOutlined } from '@material-ui/icons'


import swal from '@sweetalert/with-react'
import { TopicContainer } from '../../components/Topics/TopicsContainer'
import Header from '../../components/Header/Header'

import { DsbApiService } from '../../services/dsb-api.service'
import { isAuthorized } from '../../services/auth.service'
import { ErrorCode, Result, serializeError, Channel, Option, ErrorBodySerialized, Topic } from '../../utils'

type Props = {
    health: Result<boolean, ErrorBodySerialized>
    channels: Result<Channel[], ErrorBodySerialized>
    topics: Result<Topic[], ErrorBodySerialized>
    auth: Option<string>
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<{
    props: Props
}> {
    const authHeader = context.req.headers.authorization
    const { err } = isAuthorized(authHeader)
    if (!err) {
        const health = await DsbApiService.init().getHealth()
        const channels = await DsbApiService.init().getChannels()
        const topics = await DsbApiService.init().getTopics()

        return {
            props: {
                health: serializeError(health),
                channels: serializeError(channels),
                topics: serializeError(topics),
                auth: authHeader ? { some: authHeader } : { none: true }
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
                channels: {},
                topics: {},
                auth: { none: true }
            }
        }
    }
}

export default function FileUpload({ health, channels, topics, auth }:
    InferGetServerSidePropsType<typeof getServerSideProps>) {
    const classes = useStyles()

    // useEffect(() => {
    //     if (health.err) {
    //         return swal('Error', health.err.reason, 'error')
    //     }
    //     if (channels.err) {
    //         console.log('channels.err', channels.err)
    //         return swal('Error', channels.err.reason, 'error')
    //     }

    //     if (topics.err) {
    //         console.log('channels.err', channels.err)
    //         return swal('Error', topics.err.reason, 'error')
    //     }

    // }, [health, channels, topics])

    return (
        <div>
            <Head>
                <title>EW-DSB Client Gateway - Topic List</title>
                <meta name="description" content="EW-DSB Client Gateway" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Header />

                <Container maxWidth="lg">
                    <section className={classes.connectionStatus}>
                        <Typography variant="h4">Application name 1 </Typography>
                    </section>
                    <div style={{ display: "flex" }}>
                        <section className={classes.searchText}>
                            <Typography variant="h4">Search </Typography>
                            <TextField
                                style={{
                                    width: 300,
                                    borderWidth: 2,
                                    borderColor: "#CED1D5",
                                    paddingLeft: '2rem'
                                }}
                                fullWidth
                                id="standard-bare"
                                variant="outlined"
                                defaultValue="How can we help"
                                InputProps={{
                                    endAdornment: (
                                        <IconButton>
                                            <SearchOutlined />
                                        </IconButton>
                                    ),
                                }}
                            />
                            <Button style={{ justifyContent: 'flex-end' }} className={classes.connectionStatusPaper}>
                                Create
                            </Button>
                        </section>
                    </div>

                    <section className={classes.table}>
                        <TopicContainer auth={auth.some} topics={topics.ok} />
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
    searchText: {
        display: 'flex',
        paddingTop: '1rem',
        alignItems: 'center',
        'font-size': '8 px',
        '& *': {
            color: '#6E6B7B'
        }
    },
    connectionStatusPaper: {
        padding: '.5rem 1rem',
        marginLeft: '1rem',
        background: theme.palette.secondary.main,
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        color: '#FFFFFF',
        justifyContent: 'flex-end'

    },
    div: {
        display: 'flex',
        justifyContent: 'flex-end'
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
    },
    table: {
        marginTop: '1rem',
    }
}))
