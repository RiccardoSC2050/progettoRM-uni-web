const DEFAULT_MOBILE_QUERY = "(max-width: 700px)";

export function getResponsivePageSize(desktopSize = 15, mobileSize = 3, mobileQuery = DEFAULT_MOBILE_QUERY) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return desktopSize;
  }

  return window.matchMedia(mobileQuery).matches ? mobileSize : desktopSize;
}
