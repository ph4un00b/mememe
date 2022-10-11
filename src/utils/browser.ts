export function isMobile() {
    return / Android | webOS | iPhone | iPod | BlackBerry | IEMobile | Opera Mini /i.test(
        window.navigator.userAgent
    )
}

export function isIpod() {
    return /iPod/i.test(window.navigator.userAgent)
}
