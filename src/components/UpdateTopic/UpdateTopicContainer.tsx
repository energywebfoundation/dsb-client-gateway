import { Topic as TopicType } from '../../utils'
import UpdateTopic from './UpdateTopic'
import swal from '@sweetalert/with-react'
import { useState } from 'react'
import axios from 'axios'


type UpdateTopicContainerProps = {
    topic: TopicType | undefined
    did?: string
    auth?: string

}

export const UpdateTopicContainer = ({ topic, did, auth }: UpdateTopicContainerProps) => {

    const [isLoading, setIsLoading] = useState(false)

    const handleUpdateTopic = async (body: TopicType) => {
        setIsLoading(true)

        try {
            const res = await axios.patch(
                `/api/v1/topics`,
                body,
                {
                    headers: {
                        Authorization: auth ? `Bearer ${auth}` : undefined,
                        'content-type': 'application/json'
                    }
                }
            )
            console.log(res.data)

            swal(`Success: `, `Topic Created Successfully`, 'success')
        } catch (err) {
            if (axios.isAxiosError(err)) {
                swal('Error', err.response?.data?.err?.reason, 'error')
            } else {
                swal('Error', `Could not set identity: ${err}`, 'error')
            }
            setIsLoading(false)
        }
    }


    return <UpdateTopic topic={topic} myDID={did} handleUpdateTopic={handleUpdateTopic} />
}
