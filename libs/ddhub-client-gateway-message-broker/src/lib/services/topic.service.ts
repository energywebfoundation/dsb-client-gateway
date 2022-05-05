import { Injectable, Logger } from '@nestjs/common';
import {
  TopicEntity,
  TopicRepositoryWrapper,
} from '@dsb-client-gateway/dsb-client-gateway-storage';

@Injectable()
export class TopicService {
  protected readonly logger = new Logger(TopicService.name);

  constructor(protected readonly wrapper: TopicRepositoryWrapper) {}

  public async getTopics(
    limit: number,
    name: string,
    owner: string,
    page: number,
    tags: string[]
  ): Promise<TopicEntity[]> {
    return this.wrapper.topicRepository.getTopicsBySearch(
      limit,
      name,
      owner,
      page,
      tags
    );
  }
}
