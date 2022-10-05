import * as R from 'react'

/** @link https://overreacted.io/making-setinterval-declarative-with-react-hooks/ */
export function useTimeout(callback: () => void, delay: number) {
    const savedCallback = R.useRef<() => void>(null!);

    R.useEffect(() => {
        savedCallback.current = callback;
    });

    R.useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        let id = window.setTimeout(tick, delay);
        return () => window.clearTimeout(id);
    }, [delay]);
}