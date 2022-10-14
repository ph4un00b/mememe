import Header from '@/config'
import Dom from '@/components/layout/dom'
import '@/styles/index.css'
import dynamic from 'next/dynamic'
import { AudioPlayerProvider } from 'react-use-audio-player'
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'
import * as R from 'react'
import { log } from 'next-axiom'
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaLoadingIndicator,
  MediaMuteButton,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from 'media-chrome/dist/react'

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

function App({ Component, router, pageProps = { title: 'index' } }) {
  // Refresh features and targeting attributes on navigation
  R.useEffect(() => {
    fetch(FEATURES_ENDPOINT)
      .then((res) => res.json())
      .then((json) => {
        growthbook.setFeatures(json.features)
      })
      .catch(() => {
        log.error('🧪 Failed to fetch feature definitions from GrowthBook')
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
            <Component {...pageProps} rolas={MediaPlayer} />
          </GrowthBookProvider>
        </Dom>
        {Component?.r3f && <LCanvas>{Component.r3f(pageProps)}</LCanvas>}
      </AudioPlayerProvider>
    </>
  )
}

export { reportWebVitals } from 'next-axiom'
export default App

function MediaPlayer({
  children,
  colorButton,
}: {
  children: R.ReactNode
  colorButton?: R.ReactNode
}) {
  /*
                 * maybe ping mux? as showcase?
                /*
                 * maybe ping r3f? as showcase?
                 */
  return (
    <>
      <MediaController
        MediaController
        audio
        // @link https://media-chrome-docs.vercel.app/en/styling
        style={{
          '--media-control-background': 'rgba(0,0,0,0.5)',
        }}
      >
        {children}
        {/* <audio
                                                  slot='media'
                                                  src='https://stream.mux.com/O4h5z00885HEucNNa1rV02wZapcGp01FXXoJd35AHmGX7g/audio.m4a'
                                              /> */}
        <MediaControlBar>
          {/* <MediaLoadingIndicator /> */}
          {/* @link https://media-chrome-docs.vercel.app/en/keyboard-shortcuts
           * preventing seek
           */}
          <MediaPlayButton keysused={'Space'} />
          <MediaTimeDisplay show-duration={false} />
          {/* <MediaTimeRange /> */}
          {/* <MediaPlaybackRateButton /> */}
          <MediaMuteButton />
          <MediaVolumeRange />
          {/*
           * media-only <MediaFullscreenButton />
           * //todo: we should offer a fullscren option for the whole visual
           */}
          {/* <MediaFullscreenButton /> */}
        </MediaControlBar>
      </MediaController>

      {colorButton}
    </>
  )
}