/* eslint-disable */

declare namespace Nage {
  export type Entry = {
    [key: string]: any;
    [index: number]: any;
  };

  export type Creator<Pooled> = () => Pooled;

  export type Handler<Pooled> = (entry: Pooled) => void;

  export type ResetHandler<Pooled> = (stack: Pooled[]) => void;

  export type Options<Pooled> = {
    create?: Creator<Pooled>;
    initialSize?: number;
    maxSize?: number;
    name?: number | string | symbol;
    onRelease?: Handler<Pooled>;
    onReserve?: Handler<Pooled>;
    onReset?: ResetHandler<Pooled>;
  };
}

declare interface NagePool<Pooled> {
  constructor(options: Nage.Options<Pooled>): NagePool<Pooled>;

  available: number;
  reserved: number;
  size: number;

  release(entry: Pooled): void;
  releaseN(entries: Pooled[]): void;
  reserve(): Pooled;
  reserveN(size: number): Pooled[];
  reset(): void;
}

export default function nage<Pooled>(options?: Nage.Options<Pooled>): NagePool<Pooled>;
