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

type Props = {
    data: { dialogTitle: string, dialogText: string }
    onClose: any,
    selectedValue: string
    open: boolean
}

export default function SimpleDialog(props: Props) {
    const { onClose, selectedValue, open, data } = props
    let topicName = ''
    let version = ''
    let tags = []
    let schemaType = ''
    let jsonSchema = {}
    let dialogText = data.dialogText
    let dialogTitle = data.dialogTitle

    const [schema, setSchema] = React.useState({})

    const classes = useStyles()

    const handleClose = () => {
        onClose(selectedValue)
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
                                placeholder={topicName ? topicName : 'Topic Name'}
                            />
                        </div>
                    </Grid>

                    <Grid style={{ paddingLeft: 30 }} item xs={6} sm={5} md={3}>
                        <div className={classes.formGroup}>
                            <Typography variant="caption">Version</Typography>
                            <CustomInput
                                placeholder={version ? version : 'Version'}
                                fullWidth />
                        </div>
                    </Grid>


                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={7} md={9}>
                            <div className={classes.formGroup}>
                                <Typography variant="caption">Tags</Typography>
                                <CustomInput
                                    placeholder='Tags'
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
                                        // value={topicName}
                                        // onChange={(event: any) => setTopicName(event.target.value)}
                                        input={<CustomInput />}
                                        fullWidth
                                    >
                                        {/* {topics?.map((topic) => (
                                        <MenuItem key={topic.namespace} value={topic.namespace}>
                                            {topic.namespace}
                                        </MenuItem>
                                    ))} */}

                                    </Select>
                                </FormControl>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={10} md={9}>
                            <div className={classes.formGroup}>
                                <Typography variant="caption">Schema</Typography>

                                <div style={{ maxWidth: "1400px", maxHeight: "100%" }}>
                                    <JSONInput
                                        placeholder={jsonSchema} // data to display
                                        theme="dark_vscode_tribute"
                                        // onKeyPressUpdate='false'
                                        // waitAfterKeyPress='1'
                                        locale={locale}
                                        colors={{
                                            error: "#DAA520"
                                            // overrides theme colors with whatever color value you want
                                        }}
                                        onChange={(event: any) => setSchema(event.json)}
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
                                    // if (!channelName) {
                                    //     return swal('Error', 'Please enter channel name', 'error')
                                    // }
                                    // if (!file) {
                                    //     return swal('Error', 'No file uploaded', 'error')
                                    // }
                                    // onUpload(file, channelName, topicName)
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
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
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