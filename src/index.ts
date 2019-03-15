import Nage from './Nage';

/**
 * @function createNage
 *
 * @description
 * builder for Nage instances
 *
 * @param options the options to create the pool with
 * @returns the Nage instance
 */
function createNage(options?: Options) {
  return new Nage(options);
}

export default createNage;
