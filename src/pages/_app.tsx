import Header from '@/config'
import Dom from '@/components/layout/dom'
import '@/styles/index.css'
import dynamic from 'next/dynamic'
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'
import * as R from 'react'
import { log } from 'next-axiom'
import useSWR from 'swr'

const LCanvas = dynamic(() => import('@/components/layout/canvas'), {
  ssr: true,
})

const FEATURES_ENDPOINT = 'https://fauflags.deno.dev'

const growthbook = new GrowthBook({
  trackingCallback: (experiment, result) => {
    log.debug('🧪', { jamon: 'Viewed Experiment', experiment, result })
    // console.log("Viewed Experiment", experiment, result);
  },
})

async function fetcher(url: string) {
  const response = await window.fetch(url);
  const json = await response.json();
  growthbook.setFeatures(json.features);
  return { status: 'ok' } as const;
}


function App({ Component, router, pageProps = { title: 'index' } }) {
  const { data, error, isLoading } = useSWR(FEATURES_ENDPOINT, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error) {
    log.error('🧪 Failed to fetch feature definitions from GrowthBook')
    return (
      <>
        <Header title={pageProps.title} />
        <Dom>
          <Component {...pageProps} />
        </Dom>
        {Component?.r3f && <LCanvas>{Component.r3f(pageProps)}</LCanvas>}
      </>
    )
  }

  if (isLoading) return 'Loading...'

  if (data.status === 'ok')
    return (
      <>
        <Header title={pageProps.title} />
        <Dom>
          <GrowthBookProvider growthbook={growthbook}>
            <Component {...pageProps} />
          </GrowthBookProvider>
        </Dom>
        {Component?.r3f && <LCanvas>{Component.r3f(pageProps)}</LCanvas>}
      </>
    )
}

export default App

