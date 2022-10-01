import create from 'zustand'
import shallow from 'zustand/shallow'

type MyGlobalState = {
  dom: HTMLDivElement | null;
  // color2: string;
  // intensiveComputation: string;
  // changecolor1: (value: string) => void;
  // changecolor2: (value: string) => void;
};

const useStoreImpl = create<MyGlobalState>(() => {
  return {
    dom: null,
  }
})

const useStore = (sel: (state: any) => any) => useStoreImpl(sel, shallow)

Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

export { getState, setState }
export default useStore
