export function getUrlWithPath(newPath?: string): string {
  const currentUrl = window.location.href;
  if (newPath) {
    const urlObj = new URL(currentUrl);
    if (urlObj.pathname !== newPath) {
      urlObj.pathname = newPath;
      urlObj.search = "";
      return urlObj.href;
    }
  }
  return currentUrl;
}
