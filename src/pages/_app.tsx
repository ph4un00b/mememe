import Header from '@/config'
import Dom from '@/components/layout/dom'
import '@/styles/index.css'
import dynamic from 'next/dynamic'
import { AudioPlayerProvider } from 'react-use-audio-player'

const LCanvas = dynamic(() => import('@/components/layout/canvas'), {
  ssr: true,
})

function App({ Component, pageProps = { title: 'index' } }) {
  return (
    <>
      <Header title={pageProps.title} />
      <AudioPlayerProvider>
        <Dom>
          <Component {...pageProps} />
        </Dom>
        {Component?.r3f && <LCanvas>{Component.r3f(pageProps)}</LCanvas>}
      </AudioPlayerProvider>
    </>
  )
}

export { reportWebVitals } from 'next-axiom'
export default App
