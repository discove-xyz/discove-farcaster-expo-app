/**
 *
 * https://gist.github.com/davidrleonard/259fe449b1ec13bf7d87cde567ca0fde
 *
 * Implements all the behaviors of moment.fromNow(). Pass a
 * valid JavaScript Date object and the method will return the
 * time that has passed since that date in a human-readable
 * format. Passes the moment test suite for `fromNow()`.
 * See: https://momentjs.com/docs/#/displaying/fromnow/
 *
 * @example
 *
 *     var pastDate = new Date('2017-10-01T02:30');
 *     var message = fromNow(pastDate);
 *     //=> '2 days ago'
 *
 */
export function fromNow(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const years = Math.floor(seconds / 31536000);
  const months = Math.floor(seconds / 2592000);
  const days = Math.floor(seconds / 86400);

  if (days > 548) {
    return years + "y";
  }
  if (days >= 320) {
    return "1y";
  }
  if (days >= 45) {
    return months + "mo";
  }
  if (days >= 26) {
    return "1mo";
  }

  const hours = Math.floor(seconds / 3600);

  if (hours >= 48) {
    return days + "d";
  }
  if (hours >= 22) {
    return "1d";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes >= 120) {
    return hours + "h";
  }
  if (minutes >= 45) {
    return "1h";
  }
  if (minutes >= 1) {
    return minutes + "m";
  }

  // Don't render a label for seconds, so that it doesn't have SSR issues due to mismatch at hydration.
  // this issue can still happen with minutes, but its much less likely.
  return "1m";
}
