export enum Queries {
  Namespace = 'namespace',
  TopicId = 'topicId',
  FQCN = 'fqcn',
}

export const routerConst = {
  InitialPage: '/',
  Dashboard: '/dashboard',
  GatewaySettings: '/gateway-settings',
  AppsAndTopics: '/applications',
  Topics: `/applications/[${Queries.Namespace}]`,
  Channels: '/channels',
  Channel: `/channels/[${Queries.FQCN}]`,
  IntegrationAPIs: '/integration',
  LargeDataMessagingFileUpload: '/large-file-upload',
  LargeDataMessagingFileDownload: '/large-file-download',
  DataMessagingFileUpload: '/file-upload',
  DataMessagingFileDownload: '/file-download',
  VersionHistory: `/applications/[${Queries.Namespace}]/[${Queries.TopicId}]/version-history`,
};
