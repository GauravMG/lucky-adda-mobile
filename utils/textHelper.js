export function containsAlphabets(text) {
  return /[a-zA-Z]/.test(text);
}

export function formatToTwoDigits(num) {
  return parseFloat(num).toFixed(2);
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN').format(amount);
}
