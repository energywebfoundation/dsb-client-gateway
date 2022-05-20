import Head from 'next/head';
import { TopicsContainer } from '@ddhub-client-gateway-frontend/ui/topics';

export default function Topics() {

  return (
    <div>
      <Head>
        <title>EW-DSB Client Gateway - Topics</title>
        <meta name="description" content="EW-DSB Client Gateway" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
          <TopicsContainer />
      </main>
    </div>
  );
}
