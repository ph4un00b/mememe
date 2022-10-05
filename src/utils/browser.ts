export function isMobile() {
    return / Android | webOS | iPhone | iPod | BlackBerry | IEMobile | Opera Mini /i.test(
        window.navigator.userAgent
    )
}
