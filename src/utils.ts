/**
 * @function getEmptyObject
 *
 * @description
 * default create function, returns a new empty object
 *
 * @returns an empty object
 */
export function getEmptyObject() {
  return {};
}

/**
 * @function notifyError
 *
 * @description
 * notify the system that an error has occurred
 *
 * in development, an error is thrown
 * in production, an error is logged to the console
 *
 * @param message the message to notify with
 */
export function notifyError(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }

  // eslint-disable-next-line no-console
  console.error(message);
}
