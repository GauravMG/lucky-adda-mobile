export function addQuerySymbol(url) {
  if (url.includes('?')) {
    return url + '&';
  } else {
    return url + '?';
  }
}
