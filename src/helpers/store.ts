import create from 'zustand'
import shallow from 'zustand/shallow'

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
  songPosition: number
  changeSongPosition: (val: number) => void
  // color2: string;
  // intensiveComputation: string;
  // changecolor1: (value: string) => void;
  // changecolor2: (value: string) => void;
}

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
        return ({
          ...prev,
          songPosition: val,
        })
      }
      )
    },
  }
})

const useStore = (sel: (state: MyGlobalState) => any) => useStoreImpl(sel, shallow)

Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

export function useDebugBeats() {
  const state = useStore((state) => state.debugBeats);
  const setState = useStore((state) => state.changeBeats);
  return [state, setState] as const;
}

export function useDebugParticles() {
  const state = useStore((state) => state.debugParticles);
  const setState = useStore((state) => state.changeParticles);
  return [state, setState] as const;
}

export function useDebugSegments() {
  const state = useStore((state) => state.debugSegments);
  const setState = useStore((state) => state.changeSegments);
  return [state, setState] as const;
}

export function useDebugSections() {
  const state = useStore((state) => state.debugSections);
  const setState = useStore((state) => state.changeSections);
  return [state, setState] as const;
}

export function useSongPosition() {
  const state = useStore((state) => state.songPosition);
  const setState = useStore((state) => state.changeSongPosition);
  return [state, setState] as const;
}

export function useFPS() {
  const state = useStore((state) => state.fps);
  const setState = useStore((state) => state.setFPS);
  return [state, setState] as const;
}

export { getState, setState }
export default useStore
