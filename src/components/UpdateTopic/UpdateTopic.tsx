import { useEffect, useState } from 'react'
import Head from 'next/head'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { makeStyles } from '@material-ui/styles'
import { Container, Theme, } from '@material-ui/core'
import swal from '@sweetalert/with-react'
import Header from '../../components/Header/Header'
import { DsbApiService } from '../../services/dsb-api.service'
import { isAuthorized } from '../../services/auth.service'
import { ErrorCode, Result, serializeError, Channel, Option, ErrorBodySerialized, Topic } from '../../utils'

import SimpleDialog from '../../pages/topicdialog'

type Props = {
    topic: Topic | undefined
    myDID?: string
}


export default function UpdateTopic({ topic, myDID }: Props) {
    const classes = useStyles()

    const [open, setOpen] = useState(false)
    const selectedValue = 'vikaskum660@gmail.com'

    let data = {
        dialogTitle: 'Create Topic',
        dialogText: 'Provide Topic data with this form',
        topicName: 'Topic name',
        version: '1.0.0',
        tags: ['Aggregator'],
        jsonSchema: {}
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = (value) => {
        setOpen(false)

    }

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
                    <SimpleDialog
                        data={data}
                        onClose={handleClose}
                        selectedValue={selectedValue}
                        open={open}
                    />
                </Container>
            </main>
        </div >
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
    },
    navLink: {
        fontSize: '1rem',

        '&:hover': {
            textDecorationLine: 'underline',
            color: theme.palette.secondary.main
        }
    },
    active: {
        color: theme.palette.secondary.main
    }
}))
