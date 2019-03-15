/* eslint-disable */

declare const DEV: boolean;

type Entry = {
  [key: string]: any;
  [index: number]: any;
};

type Creator = (...args: any[]) => Entry;

type Handler = (entry: Entry) => void;

type Options = {
  create?: Creator;
  onRelease?: Handler;
  onReserve?: Handler;
};
