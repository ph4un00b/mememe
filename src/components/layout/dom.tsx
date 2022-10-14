import {
  setState,
  useGlobalColors,
  usePlayerPortals,
} from '@/helpers/store'

import * as R from 'react'
import { MediaPlayerMemo } from '../MediaPlayer'

const Dom = ({ children }) => {
  const ref = R.useRef<HTMLDivElement | null>(null)
  R.useEffect(() => {
    /** @ts-ignore todo: why?? */
    setState({ dom: ref })
  }, [])

  const [, setPortalOut] = usePlayerPortals()
  const portalOut = R.useRef(null!)

  R.useEffect(() => {
    setPortalOut(portalOut.current)
  }, [])

  const [colors] = useGlobalColors()

  return (
    <div
      className='absolute top-0 left-0 z-10 w-screen h-screen overflow-hidden dom'
      ref={ref}
    >
      {children}

      <div
        // eslint-disable-next-line tailwind/class-order
        className='absolute px-0 pb-[1.5px] text-sm transform -translate-x-1/2 shadow-xl select-none bottom-2 md:text-base left-1/2 text-gray-50'
        style={{
          maxWidth: 'calc(100% - 28px)',
          background: `-webkit-linear-gradient(180deg, ${colors[0]}, ${colors[1]})`,
        }}
      >
        <div ref={portalOut} className='flex flex-row justify-center bg-black'>
          <MediaPlayerMemo />
        </div>
        {/* <span >{florColor[0]}</span> */}
      </div>
    </div>
  )
}

export default Dom
