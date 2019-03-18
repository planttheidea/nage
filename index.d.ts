/* eslint-disable */

declare namespace Nage {
  export type Entry = {
    [key: string]: any;
    [index: number]: any;
  };

  export type Creator = () => Entry;

  export type Handler = (entry: Entry) => void;

  export type ResetHandler = (stack: Entry[]) => void;

  export type Options = {
    create?: Creator;
    initialSize?: number;
    onRelease?: Handler;
    onReserve?: Handler;
    onReset?: ResetHandler;
  };
}

declare interface NagePool {
  constructor(options: Nage.Options): NagePool;

  available: number;
  reserved: number;
  size: number;

  release(entry: Nage.Entry): void;
  reserve(): Nage.Entry;
  reset(): void;
}

export default function nage(options?: Nage.Options): NagePool;
