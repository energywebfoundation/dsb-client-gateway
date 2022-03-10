import { makeStyles } from '@material-ui/styles'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary as MuiAccordionSummary,
    Theme,
    Typography,
    withStyles,
    withWidth
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Topic as TopicType } from '../../utils'
import { JsonView, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import TopicTable from '../Table/Table'
import dataRows from "../TableInput/TableInput"

import { TOPIC_HEADERS as topicHeaders } from '../../utils'

type TopicProps = {
    applicationName?: string
    topics: TopicType[] | undefined
    myDID?: string
}

export default function Topic({ topics, myDID }: TopicProps) {
    const classes = useStyles()

    const isPubSub = () => {
        if (!myDID) {
            return
        }
    }

    return (
        <div >
            {/* <div className={classes.navbar}></div> */}
            <TopicTable
                headers={topicHeaders}
                dataRows={topics}
            />
        </div>
    )
}

const useStyles = makeStyles((theme: Theme) => ({

    navbar: {
        position: 'absolute',
        background: '#293145',
        left: '0%',
        right: '0%',
        top: '0%',
        bottom: '0%'
    },
    container: {
        margin: '2rem'
    },
    accordion: {
        backgroundColor: theme.palette.secondary.light
    },
    accordionTitle: {
        color: theme.palette.info.contrastText,
        '& div': {
            display: 'flex',
            justifyContent: 'space-between'
        }
    },
    name: {
        fontWeight: 'bold'
    },
    sectionTitle: {
        margin: '1rem 0.5rem',
        color: theme.palette.info.contrastText,
        textDecorationStyle: 'wavy'
    },
    channelDetail: {
        display: 'flex',
        flexDirection: 'column'
    },
    channel: {
        color: '#fff',
        background: '#52446F',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',

        '& span': {
            fontSize: '.9rem'
        },
        '&:hover': {
            cursor: 'pointer'
        }
    },
    jsonContainer: {
        fontFamily: 'monospace'
    }
}))


