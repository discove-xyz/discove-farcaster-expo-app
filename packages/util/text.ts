export function shortenText(s: string, length: number) {
  if (!s || s.length <= length) return s;

  return `${s.substring(0, length - 1 - 3)}...`;
}
