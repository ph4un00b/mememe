import create from 'zustand'
import shallow from 'zustand/shallow'
import * as R from 'react'
import { baseUrl } from '@/utils/external'

type MyGlobalColors = {
  changedColorsCounter: number
  changeColors: () => void
  coloritos: [string, string]
  changeColoritos: (val: [string, string]) => void
}

type MyGlobalMusic = {
  songPosition: number
  changeSongPosition: (val: number) => void
  seekedPosition: number
  seekSongPosition: (val: number) => void
  isSongPlaying: boolean
  setIsSongPlaying: (val: boolean) => void
  currentTrack: string
  changeTrack: (path: string) => void
  triggerElement1: R.ReactNode
  setTrigger1Element1: (
    portalNode: R.ReactNode
  ) => void
}

type MyGlobalState = {
  dom: HTMLDivElement | null
  fps: number
  setFPS: (val: number) => void
  debugBeats: number
  changeBeats: (val: number) => void
  debugSegments: number
  changeSegments: (val: number) => void
  debugSections: number
  changeSections: (val: number) => void
  debugParticles: number
  changeParticles: (val: number) => void
  // color2: string;
  // intensiveComputation: string;
  // changecolor1: (value: string) => void;
  // changecolor2: (value: string) => void;
} & MyGlobalColors &
  MyGlobalMusic

const useStoreImpl = create<MyGlobalState>((set) => {
  return {
    dom: null,
    fps: 1,
    setFPS: (val) => {
      set((prev) => ({
        ...prev,
        fps: val,
      }))
    },
    debugBeats: 0,
    changeBeats: (val) => {
      set((prev) => ({
        ...prev,
        debugBeats: val,
      }))
    },
    debugSegments: 0,
    changeSegments: (val) => {
      set((prev) => ({
        ...prev,
        debugSegments: val,
      }))
    },
    debugSections: 0,
    changeSections: (val) => {
      set((prev) => ({
        ...prev,
        debugSegments: val,
      }))
    },
    debugParticles: 0,
    changeParticles: (val) => {
      set((prev) => ({
        ...prev,
        debugParticles: val,
      }))
    },
    songPosition: 0,
    changeSongPosition: (val) => {
      set((prev) => {
        // console.log(`prev`, prev)
        return {
          ...prev,
          songPosition: val,
        }
      })
    },
    seekedPosition: 0,
    seekSongPosition: (val) => {
      set((prev) => {
        // console.log(`prev`, prev)
        return {
          ...prev,
          seekedPosition: prev.seekedPosition + 1,
        }
      })
    },
    isSongPlaying: false,
    setIsSongPlaying: (val: boolean) => {
      set((prev) => {
        // console.log(`prev`, prev)
        return {
          ...prev,
          isSongPlaying: val,
        }
      })
    },
    changedColorsCounter: 0,
    changeColors: () => {
      set((prev) => {
        // console.log(`prev`, prev)
        return {
          ...prev,
          changedColorsCounter: prev.changedColorsCounter + 1,
        }
      })
    },
    coloritos: ['#bb0000', '#00ff00'],
    changeColoritos: (value) => {
      set((prev) => {
        // console.log(`prev`, prev)
        return {
          ...prev,
          coloritos: [...value],
        }
      })
    },
    currentTrack: `${baseUrl}/casa/source.mus`,
    changeTrack: (path) => {
      set((prev) => {
        return {
          ...prev,
          currentTrack: path,
        }
      })
    },
    triggerElement1: null,
    setTrigger1Element1: (portalNode) => {
      set((prev) => {
        return {
          ...prev,
          triggerElement1: portalNode,
        }
      })
    },
  }
})

const useStore = (sel: (state: MyGlobalState) => any) =>
  useStoreImpl(sel, shallow)

Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

export function useDebugBeats() {
  const state = useStore((state) => state.debugBeats)
  const setState = useStore((state) => state.changeBeats)
  return [state, setState] as const
}

export function useDebugParticles() {
  const state = useStore((state) => state.debugParticles)
  const setState = useStore((state) => state.changeParticles)
  return [state, setState] as const
}

export function useDebugSegments() {
  const state = useStore((state) => state.debugSegments)
  const setState = useStore((state) => state.changeSegments)
  return [state, setState] as const
}

export function useDebugSections() {
  const state = useStore((state) => state.debugSections)
  const setState = useStore((state) => state.changeSections)
  return [state, setState] as const
}

export function useSongPosition() {
  const state = useStore((state) => state.songPosition)
  const setState = useStore((state) => state.changeSongPosition)
  return [state, setState] as const
}

export function useSeekPosition() {
  const state = useStore((state) => state.seekedPosition)
  const setState = useStore((state) => state.seekSongPosition)
  return [state, setState] as const
}

export function useAudioStatus() {
  const state = useStore((state) => state.isSongPlaying)
  const setState = useStore((state) => state.setIsSongPlaying)
  return [state, setState] as const
}

export function useTriggerChangeColor() {
  // todo: an event could be better?
  const state = useStore((state) => state.changedColorsCounter)
  const setState = useStore((state) => state.changeColors)
  return [state, setState] as const
}

export function useGlobalColors() {
  const state = useStore((state) => state.coloritos)
  const setState = useStore((state) => state.changeColoritos)
  return [state, setState] as const
}

export function useMediaPlayer() {
  const state = useStore((state) => state.currentTrack)
  const setState = useStore((state) => state.changeTrack)
  return [state, setState] as const
}

export function usePlayerPortals() {
  const state = useStore((state) => state.triggerElement1)
  const setState = useStore((state) => state.setTrigger1Element1)
  return [state, setState] as const
}

export { getState, setState }
export default useStore
