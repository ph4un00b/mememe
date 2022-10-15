import { useAudioStatus, useMediaPlayer, useSongPosition } from '@/helpers/store'
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

import * as R from 'react'
import * as X from 'next-axiom'
import * as hooks from '@/utils/hooks'

export const MediaPlayerMemo = R.memo(MediaPlayer)
function MediaPlayer() {
    // console.log('rr?')
    /*
                   * maybe ping mux? as showcase?
                  /*
                   * maybe ping r3f? as showcase?
                   */
    const [trackChanged] = useMediaPlayer()
    const started = R.useRef(false)
    const [, setSongPosition] = useSongPosition()
    const [, setPlaying] = useAudioStatus()
    const [ended, setEnd] = R.useState(false)
    const sound = R.useRef<HTMLAudioElement>(null!)

    R.useEffect(() => {
        X.log.debug(' 🎼', { sopa: 'changed track', track: trackChanged })
        if (sound.current) {
            sound.current.pause();
            sound.current.load();
            // this line below might not work on mobile devices
            // do not use!
            // sound.current.play();
            // todo: do not use a magic number
            setSongPosition(-1)
        } else {
            X.log.error('🌸', {
                sopa: '📛 no sound',
                track: trackChanged,
                agent: window.navigator.userAgent
            })
        }
    }, [trackChanged])

    useAudioHooks(sound, {
        onerror: (e) => {
            X.log.error('🌸', {
                sopa: '📛 something went wrong',
                track: trackChanged,
                agent: window.navigator.userAgent,
                e
            })
        },
        onended: () => {
            setEnd(true)
            // todo: create a hash mapping routes with an emoji
            X.log.debug('🌸', { ended: true, sopa: 'termino 🎊💃' })
            setPlaying(false)
        },
        onpause: () => {
            started.current = false
            X.log.debug('🌸', { sopa: 'pause musique 🎼' })
            setPlaying(false)
        },
        onplay: () => {
            started.current = true
            X.log.debug('🌸', { sopa: 'play musique 🎼' })
            setPlaying(true)
        },
        onchanged: (e) => {
            // console.log(sound.current.currentTime)
            // console.log(e.timeStamp)
            setSongPosition(sound.current.currentTime)
        },
    })

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
                <audio slot='media' ref={sound} loop={false} preload='auto'>
                    <source
                        // todo: this might be extra stuff, since we use a audio ref
                        src={trackChanged}
                        type='audio/mpeg'
                    />
                </audio>
                {/* {children} */}
                {/* <audio
                                                  slot='media'
                                                  src='https://stream.mux.com/O4h5z00885HEucNNa1rV02wZapcGp01FXXoJd35AHmGX7g/audio.m4a'
                                              /> */}
                <MediaControlBar>
                    {/* <MediaLoadingIndicator /> */}
                    {/* @link https://media-chrome-docs.vercel.app/en/keyboard-shortcuts
           * preventing seek
           */}
                    {/* //todo: we might want a loading status in the play button */}
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

            <button
                className='pr-2'
                onClick={() => {
                    X.log.debug('🌸', { sopa: 'full screen! 💻' })
                }}
            >
                full screen
            </button>
        </>
    )
}

function useAudioHooks(
    sound: R.MutableRefObject<HTMLAudioElement>,
    {
        onerror,
        onended,
        onpause,
        onplay,
        onchanged,
    }: {
        onerror: (e) => void
        onended: (e) => void
        onpause: (e) => void
        onplay: (e) => void
        onchanged: (e) => void
    }
) {
    /**
     * @link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events
     */
    hooks.useAudioListener(
        'canplay',
        (e) => {
            console.log('canplay', e)
        },
        sound
    )

    hooks.useAudioListener(
        'play',
        (e) => {
            // console.log('play', e)
            onplay(e)
        },
        sound
    )

    hooks.useAudioListener(
        'ended',
        (e) => {
            // console.log('ended', e)
            onended(e)
        },
        sound
    )

    hooks.useAudioListener(
        'durationchange',
        (e) => {
            console.log('durationchange', e)
        },
        sound
    )

    hooks.useAudioListener(
        'emptied',
        (e) => {
            console.log('emptied', e)
        },
        sound
    )
    hooks.useAudioListener(
        'pause',
        (e) => {
            // console.log('pause', e)
            onpause(e)
        },
        sound
    )
    hooks.useAudioListener(
        'playing',
        (e) => {
            console.log('playing', e)
        },
        sound
    )
    hooks.useAudioListener(
        'error',
        (e) => {
            // console.log('error', e)
            onerror(e)
        },
        sound
    )
    hooks.useAudioListener(
        'ratechange',
        (e) => {
            console.log('ratechange', e)
        },
        sound
    )
    hooks.useAudioListener(
        'seeked',
        (e) => {
            console.log('seeked', e)
        },
        sound
    )
    hooks.useAudioListener(
        'seeking',
        (e) => {
            console.log('seeking', e)
        },
        sound
    )
    hooks.useAudioListener(
        'suspend',
        (e) => {
            console.log('suspend', e)
        },
        sound
    )
    hooks.useAudioListener(
        'timeupdate',
        (e) => {
            // updates alot!
            onchanged(e)
            // console.log('timeupdate', e)
        },
        sound
    )
    hooks.useAudioListener(
        'volumechange',
        (e) => {
            // updates alot!
        },
        sound
    )
    hooks.useAudioListener(
        'waiting',
        (e) => {
            // updates alot!
        },
        sound
    )
}
