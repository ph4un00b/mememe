import Header from '@/config'
import Dom from '@/components/layout/dom'
import '@/styles/index.css'
import dynamic from 'next/dynamic'
import { AudioPlayerProvider } from 'react-use-audio-player'
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'
import * as R from 'react'
import { log } from 'next-axiom'

const LCanvas = dynamic(() => import('@/components/layout/canvas'), {
  ssr: true,
})

const FEATURES_ENDPOINT = 'https://plinks.deno.dev/growthbook'

const growthbook = new GrowthBook({
  trackingCallback: (experiment, result) => {
    log.debug('🧪', { jamon: 'Viewed Experiment', experiment, result })
    // console.log("Viewed Experiment", experiment, result);
  },
})

function App({ Component, router, pageProps = { title: 'index' } }) {
  // Refresh features and targeting attributes on navigation
  R.useEffect(() => {
    fetch(FEATURES_ENDPOINT)
      .then((res) => res.json())
      .then((json) => {
        growthbook.setFeatures(json.features)
      })
      .catch(() => {
        log.error('🧪', 'Failed to fetch feature definitions from GrowthBook')
      })

    growthbook.setAttributes({
      id: 'foo',
      deviceId: 'foo',
      company: 'foo',
      loggedIn: true,
      employee: true,
      test: true,
      country: 'foo',
      browser: window.navigator.userAgent,
      url: router.pathname,
    })
  }, [router.pathname])

  return (
    <>
      <Header title={pageProps.title} />
      <AudioPlayerProvider>
        <Dom>
          <GrowthBookProvider growthbook={growthbook}>
            <Component {...pageProps} />
          </GrowthBookProvider>
        </Dom>
        {Component?.r3f && <LCanvas>{Component.r3f(pageProps)}</LCanvas>}
      </AudioPlayerProvider>
    </>
  )
}

export { reportWebVitals } from 'next-axiom'
export default App
