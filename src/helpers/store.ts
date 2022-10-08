import create from 'zustand'
import shallow from 'zustand/shallow'

type MyGlobalState = {
  dom: HTMLDivElement | null
  debugBeats: number
  changeBeats: (val: number) => void
  debugParticles: number
  changeParticles: (val: number) => void
  // color2: string;
  // intensiveComputation: string;
  // changecolor1: (value: string) => void;
  // changecolor2: (value: string) => void;
}

const useStoreImpl = create<MyGlobalState>((set) => {
  return {
    dom: null,
    debugBeats: 0,
    changeBeats: (val) => {
      set((prev) => ({
        ...prev,
        debugBeats: val,
      }))
    },
    debugParticles: 0,
    changeParticles: (val) => {
      set((prev) => ({
        ...prev,
        debugParticles: val,
      }))
    },
  }
})

const useStore = (sel: (state: MyGlobalState) => any) => useStoreImpl(sel, shallow)

Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

function useDebugBeats() {
  const state = useStore((state) => state.debugBeats);
  const setState = useStore((state) => state.changeBeats);
  return [state, setState] as const;
}

function useDebugParticles() {
  const state = useStore((state) => state.debugParticles);
  const setState = useStore((state) => state.changeParticles);
  return [state, setState] as const;
}

export { getState, setState, useDebugBeats, useDebugParticles }
export default useStore
