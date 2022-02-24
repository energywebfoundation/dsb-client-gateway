import { Topic as TopicType } from '../../utils'
import Topic from './Topics'

type TopicContainerProps = {
    auth?: string
    topics: TopicType[] | undefined
    did?: string
}

export const TopicContainer = ({ auth, topics, did }: TopicContainerProps) => {
    return <Topic topics={topics} myDID={did} />
}
