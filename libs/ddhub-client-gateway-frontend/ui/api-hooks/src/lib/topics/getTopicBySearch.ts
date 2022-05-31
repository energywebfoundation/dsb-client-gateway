import { keyBy } from 'lodash';
import {
  GetTopicDto,
  TopicsControllerGetTopicsBySearchParams,
  topicsControllerGetTopicsBySearch,
  PaginatedSearchTopicResponse, PaginatedResponse, TopicsControllerGetTopicsParams,
} from '@dsb-client-gateway/dsb-client-gateway-api-client';
import { useState } from 'react';

export const useTopicsSearch = (
  {
    page = 1,
    limit = 0,
    keyword = '',
  }: TopicsControllerGetTopicsBySearchParams) => {

  const getTopicsSearch = async () => topicsControllerGetTopicsBySearch(
    { page, limit, keyword }
  );

  return {
    getTopicsSearch
  };
};
