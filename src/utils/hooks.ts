import * as R from "react";

/** @link https://overreacted.io/making-setinterval-declarative-with-react-hooks/ */
export function useInterval(callback: () => void, delay: number) {
    const savedCallback = R.useRef<() => void>(null!);

    R.useEffect(() => {
        savedCallback.current = callback;
    });

    R.useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        let id = window.setInterval(tick, delay);
        return () => window.clearInterval(id);
    }, [delay]);
}

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

/** @link https://usehooks.com/useEventListener/ */
import { useCallback, useEffect, useRef, useState } from "react";

export function useEventListener(eventName, handler, element = window) {
    // Create a ref that stores handler
    const savedHandler = R.useRef(null);
    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    R.useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    R.useEffect(
        () => {
            // Make sure element supports addEventListener
            // On
            const isSupported = element && element.addEventListener;

            // eslint-disable-next-line no-console
            if (!isSupported) console.error(`not suported: ${eventName} on`, element);
            if (!isSupported) return;
            // Create event listener that calls handler function stored in ref
            const eventListener = (event) => savedHandler.current(event);
            // Add event listener
            element.addEventListener(eventName, eventListener);
            // Remove event listener on cleanup
            return () => {
                element.removeEventListener(eventName, eventListener);
            };
        },
        [eventName, element], // Re-run if eventName or element changes
    );
}

export function useAudioListener(eventName, handler, audio) {
    // Create a ref that stores handler
    const savedHandler = R.useRef(null);
    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    R.useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    R.useEffect(
        () => {
            if (!audio.current) return
            const audioRef = audio.current;
            // Create event listener that calls handler function stored in ref
            const eventListener = (event) => savedHandler.current(event);
            // Add event listener
            audioRef.addEventListener(eventName, eventListener);
            // Remove event listener on cleanup
            return () => {
                audioRef.removeEventListener(eventName, eventListener);
            };
        },
        [eventName, audio]
    );
}
