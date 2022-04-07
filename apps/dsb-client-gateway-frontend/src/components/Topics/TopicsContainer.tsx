import { Topic as TopicType } from '../../utils'
import { Topics } from './Topics'

type TopicContainerProps = {
    applicationNameSpace: string | string[] | undefined
    topics: TopicType[] | undefined
    did?: string

}

export const TopicContainer = ({ applicationNameSpace, topics, did }: TopicContainerProps) => {

    // const handlePostTopic = async (body: TopicType) => {
    //     setIsLoading(true)

    //     try {
    //         const res = await axios.post(
    //             `/v1/dsb/topics`,
    //             body,
    //             {
    //                 headers: {
    //                     Authorization: auth ? `Bearer ${auth}` : undefined,
    //                     'content-type': 'application/json'
    //                 }
    //             }
    //         )
    //         console.log(res.data)

    //         Swal.fire(`Success: `, `Topic Created Successfully`, 'success')
    //     } catch (err) {
    //         if (axios.isAxiosError(err)) {
    //             Swal.fire('Error', err.response?.data?.err?.reason, 'error')
    //         } else {
    //             Swal.fire('Error', `Could not set identity: ${err}`, 'error')
    //         }
    //         setIsLoading(false)
    //     }
    // }


    // const handleUpdateTopic = async (body: TopicType) => {
    //     setIsLoading(true)

    //     try {
    //         const res = await axios.patch(
    //             `/v1/dsb/topics`,
    //             body,
    //             {
    //                 headers: {
    //                     Authorization: auth ? `Bearer ${auth}` : undefined,
    //                     'content-type': 'application/json'
    //                 }
    //             }
    //         )
    //         console.log(res.data)

    //         Swal.fire(`Success: `, `Topic Created Successfully`, 'success')
    //     } catch (err) {
    //         if (axios.isAxiosError(err)) {
    //             Swal.fire('Error', err.response?.data?.err?.reason, 'error')
    //         } else {
    //             Swal.fire('Error', `Could not set identity: ${err}`, 'error')
    //         }
    //         setIsLoading(false)
    //     }
    // }

    const handleUpdateTopic = async () => {
      console.log('update');
    }

    const handlePostTopic = async () => {
      console.log('update');
    }

    return <Topics
        applicationName={applicationNameSpace}
        topics={topics} myDID={did}
        handlePostTopic={handlePostTopic}
        handleUpdateTopic={handleUpdateTopic} />
}
