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
    name?: number | string | symbol;
    onRelease?: Handler;
    onReserve?: Handler;
    onReset?: ResetHandler;
  };
}
