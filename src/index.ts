import NagePool from './NagePool';

/**
 * @function nage
 *
 * @description
 * builder for NagePool instances
 *
 * @param options the options to create the pool with
 * @returns the Nage instance
 */
function nage(options?: Nage.Options) {
  return new NagePool(options);
}

export default nage;
