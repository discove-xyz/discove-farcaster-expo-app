import { config } from "./config";
import { Sentry } from "./sentry";

export function handleError({
  message,
  error,
  extra,
}: {
  message?: string;
  error?: Error;
  extra?: any;
}) {
  if (error) {
    console.error(error);
    if (config.env !== "dev") Sentry.captureException(error, { extra });
  }
  if (message) {
    console.log(message);
    if (config.env !== "dev") Sentry.captureMessage(message, { extra });
  }
}
