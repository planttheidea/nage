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
function nage<Pooled extends {} = Nage.Entry>(options?: Nage.Options<Pooled>) {
  return new NagePool<Pooled>(options);
}

export default nage;
