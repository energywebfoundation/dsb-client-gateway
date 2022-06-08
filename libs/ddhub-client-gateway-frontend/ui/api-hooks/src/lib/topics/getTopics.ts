import { keyBy } from 'lodash';
import {
  GetTopicDto,
  PaginatedResponse,
  useTopicsControllerGetTopics,
  TopicsControllerGetTopicsParams,
  PaginatedSearchTopicResponse, TopicsControllerGetTopicsBySearchParams
} from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { useState } from 'react';
import { useCustomAlert } from '@ddhub-client-gateway-frontend/ui/core';
import { useTopicsSearch } from './getTopicBySearch';

export const useTopics = ({
  page = 1,
  limit = 0,
  owner,
}: TopicsControllerGetTopicsParams) => {
  const Swal = useCustomAlert();
  const [keyword, setKeyword] = useState('');
  const [params, setParams] = useState({ page, limit });
  const [params2, setParams2] = useState({ page, limit, keyword });

  const { getTopicsSearch } = useTopicsSearch({
    limit: params2.limit,
    page: params2.page,
    keyword: params2.keyword,
  });

  const { data, isLoading, isSuccess, isError } = useTopicsControllerGetTopics(
    { page: params.page, limit: params.limit, owner },
    {
      query: {
        enabled: !!owner,
        onError: (err: { message: string }) => {
          console.error(err);
          Swal.error({ text: err?.message });
        },
      },
    }
  );

  let paginated = {} as PaginatedResponse;
  let topics = [] as GetTopicDto[];
  let topicsById;
  let topicsFetched;

  const setReturnValues = (data: any) => {
    paginated = data;
    topics = paginated.records; // topics not displayed when search
    topicsById = keyBy(topics, 'id');
  }

  if (!keyword && data) {
    setReturnValues(data);
    topicsFetched = isSuccess && data !== undefined && !isError;
  } else {
    topicsFetched = true; // test
  }

  const getTopics = async ({
    page = 1,
    limit = 6,
  }: Omit<TopicsControllerGetTopicsParams, 'owner'>) => {
    setParams({ page, limit });
  };

  const getTopicsBySearch = async ({
    page = 1,
    limit = 6,
    keyword = ''
  }: TopicsControllerGetTopicsBySearchParams) => {
    topicsFetched = true;
    setKeyword(keyword);
    setParams2({ page, limit, keyword });

    const filteredTopics = await getTopicsSearch();
    setReturnValues(filteredTopics);
  };

  const pagination = {
    limit: paginated?.limit,
    count: paginated?.count,
    page: paginated?.page,
  };

  return {
    topics,
    topicsById,
    isLoading,
    topicsFetched,
    getTopics,
    getTopicsBySearch,
    pagination,
  };
};
