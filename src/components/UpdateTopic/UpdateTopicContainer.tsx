import { Topic as TopicType } from '../../utils'
import UpdateTopic from './UpdateTopic'

type TopicContainerProps = {
    did?: string
    topic: TopicType | undefined
}

export const TopicContainer = ({ did, topic }: TopicContainerProps) => {
    return <UpdateTopic topic={topic} myDID={did} />
}
