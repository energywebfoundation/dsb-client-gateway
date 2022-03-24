import { Download } from './Download';
import { Channel, UnknownError } from '../../utils';
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { captureException } from '@sentry/nextjs';

type DownloadContainerProps = {
  auth?: string;
  channels: Channel[] | undefined;
};

export const DownloadContainer = ({
  auth,
  channels,
}: DownloadContainerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (
    fqcn: string,
    amount: number,
    clientId?: string
  ) => {
    setIsLoading(true);
    try {
      let query = `fqcn=${fqcn}`;
      query += amount ? `&amount=${amount}` : '';
      query += clientId ? `&clientId=${clientId}` : '';

      //@todo check file type when select by topic is available

      // const channelData = channels?.filter((channel) => {
      //   return channel.fqcn === fqcn && channel.topics && channel.topics.length > 0
      // })
      // const fileType = channelData && channelData.length > 0 ? 'json' : 'txt'

      const res = await axios.get(
        `/api/v1/message?${query}`,
        auth
          ? {
              headers: {
                Authorization: `Bearer ${auth}`,
                'content-type': 'application/json',
              },
            }
          : undefined
      );

      let payload;

      if (res.data && Array.isArray(res.data) && res.data.length === 0) {
        return Swal.fire('Info', `No recent messages to download`, 'info');
      }

      try {
        payload = JSON.parse(res.data[0].payload);
      } catch (error) {
        payload = res.data[0].payload;
      }

      const fileType = typeof payload === 'object' ? 'json' : 'txt';
      const fileName = `${fqcn}_${new Date().getTime()}.${fileType}`;
      const type =
        typeof payload === 'object' ? 'application/json' : 'application/text';
      let blob;

      if (type === 'application/json') {
        const payloadForFile = {
          payload: res.data[0].payload,
          messageId: res.data[0].id,
          transactionId: res.data[0].transactionId,
        };
        blob = new Blob([JSON.stringify(payloadForFile)], { type: type });
      } else {
        // eslint-disable-next-line max-len
        blob = new Blob(
          [
            `payload=${res.data[0].payload}`,
            `\ntransaction Id=${res.data[0].transactionId}`,
            `\nmesssage Id=${res.data[0].id}`,
          ],
          { type: type }
        );
      }

      const url = await window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      tempLink.click();

      Swal.fire(`Success`, `File downloaded Succesfully`, 'success');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        Swal.fire('Error', err.response?.data?.err?.reason, 'error');
      } else {
        const error = new UnknownError(err);
        captureException(error);
        Swal.fire('Error', `${new UnknownError(err).body}`, 'error');
      }
      setIsLoading(false);
    }
  };

  return <Download channels={channels} onDownload={handleDownload} />;
};
