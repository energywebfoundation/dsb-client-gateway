import * as React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import { Typography, Theme, Grid, Select, FormControl, MenuItem } from '@material-ui/core'
import { CustomInput } from '../../components/CustomInput/CustomInput'
import { makeStyles } from '@material-ui/styles'
import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'
import { Topic as TopicType } from '../../utils'
import swal from '@sweetalert/with-react'


type Props = {
    data?: {
        topicName: string
        version: string
        tags: string[]
        schemaType: string
        jsonSchema: object
    }

    onClose: any
    open: boolean
    dialogTitle: string
    dialogText: string
    handlePostOrUpdateTopic: (body: TopicType) => void

}

let schemaTypes = [
    { id: 1, schema: 'JSD7' },
    { id: 2, schema: 'JSD8' }
]

export default function SimpleDialog(props: Props) {
    const { onClose, handlePostOrUpdateTopic, open, data, dialogTitle, dialogText } = props

    let [jsonSchema, setJsonSchema] = React.useState({})
    let [topicName, setTopicName] = React.useState('')
    let [version, setVersion] = React.useState('')
    let [tags, setTags] = React.useState(Array)
    let [schemaType, setSchemaType] = React.useState('')

    if (data) {
        topicName = data.topicName
        version = data.version
        tags = data.tags
        schemaType = data.schemaType
        jsonSchema = data.jsonSchema
    }

    const classes = useStyles()

    const handleClose = () => {
        onClose()
    }


    return (
        <Dialog className={classes.dialog} onClose={handleClose} open={open}>

            <DialogTitle>{dialogTitle}</DialogTitle>
            <Typography>{dialogText}</Typography>
            <div className={classes.form}>
                <Grid container>
                    <Grid item xs={12} sm={7} md={6}>
                        <div className={classes.formGroup}>
                            <Typography variant="caption">Topic Name</Typography>
                            <CustomInput
                                placeholder='Topic Name'
                                value={topicName}
                                onChange={(event: any) => setTopicName(event.target.value)}
                            />
                        </div>
                    </Grid>

                    <Grid style={{ paddingLeft: 30 }} item xs={6} sm={5} md={3}>
                        <div className={classes.formGroup}>
                            <Typography variant="caption">Version</Typography>
                            <CustomInput
                                placeholder='Version'
                                value={version}
                                onChange={(event: any) => setVersion(event.target.value)}
                                fullWidth />
                        </div>
                    </Grid>


                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={7} md={9}>
                            <div className={classes.formGroup}>
                                <Typography variant="caption">Tags</Typography>
                                <CustomInput
                                    placeholder='Tags'
                                    value={tags}
                                    onChange={(event: any) => setTags(event.target.value)}
                                    fullWidth />
                            </div>
                        </Grid>


                        <Grid item xs={12} sm={7} md={9}>
                            <div className={classes.formGroup}>
                                <Typography variant="caption">Schema Type</Typography>
                                <FormControl>
                                    <Select
                                        labelId="channelLabel"
                                        id="demo-customized-select"
                                        value={schemaType}
                                        onChange={(event: any) => setSchemaType(event.target.value)}
                                        input={<CustomInput />}
                                        fullWidth
                                    >
                                        {schemaTypes?.map((schemaType) => (
                                            <MenuItem key={schemaType.id} value={schemaType.schema}>
                                                {schemaType.schema}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={10} md={9}>
                            <div className={classes.formGroup}>
                                <Typography variant="caption">Schema</Typography>

                                <div style={{ maxWidth: "1400px", maxHeight: "100%" }}>
                                    <JSONInput
                                        placeholder={jsonSchema ? jsonSchema : {}} // data to display
                                        theme="dark_vscode_tribute"
                                        // onKeyPressUpdate='false'
                                        // waitAfterKeyPress='1'
                                        locale={locale}
                                        colors={{
                                            error: "#DAA520"
                                            // overrides theme colors with whatever color value you want
                                        }}
                                        onChange={(event: any) => setJsonSchema(event.json)}
                                        height="550px"
                                    />
                                </div>

                            </div>
                        </Grid>




                        <Grid item xs={6} sm={5}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                onClick={() => handleClose()}
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item xs={6} sm={5}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                onClick={() => {

                                    if (!topicName) {
                                        return swal('Error', 'Please enter topic name', 'error')
                                    }
                                    if (!version) {
                                        return swal('Error', 'Please enter version', 'error')
                                    }

                                    if (!schemaType) {
                                        return swal('Error', 'Please enter schema type', 'error')
                                    }

                                    if (!tags) {
                                        return swal('Error', 'Please enter tags', 'error')
                                    }

                                    if (!jsonSchema) {
                                        return swal('Error', 'Please enter Json Schema', 'error')
                                    }

                                    let topicData = {
                                        name: topicName,
                                        schemaType: schemaType,
                                        schema: JSON.stringify(jsonSchema),
                                        version: version,
                                        owner: topicName,
                                        tags: ["vikas6"] // check how to take tags from user
                                    }

                                    handlePostOrUpdateTopic(topicData)

                                }}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </div>

        </Dialog >
    )
}

SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
}

const useStyles = makeStyles((theme: Theme) => ({

    dialog: {
        // width: 800,
        padding: 30,
        display: 'block',
        // backgroundColor: "#343E55"

    },
    form: {
        marginTop: '1rem',

        '& button': {
            padding: '.7rem',
            marginBottom: '1rem'
        }
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: '2rem',

        '& span': {
            fontSize: '.8rem',
            marginBottom: '.3rem'
        },
        '& *': {
            color: 'black'
        },
        '& input': {
            width: '100%'
        }
    },
    fileButton: {
        marginTop: theme.spacing(3),
        padding: '.5rem'
    }

}))