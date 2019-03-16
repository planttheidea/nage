/* eslint-disable */

declare const DEV: boolean;

declare namespace Nage {
  export type Entry = {
    [key: string]: any;
    [index: number]: any;
  };

  export type Creator = () => Entry;

  export type Handler = (entry: Entry) => void;

  export type Options = {
    create?: Creator;
    initialSize?: number;
    onRelease?: Handler;
    onReserve?: Handler;
  };
}
