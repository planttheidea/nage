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

type PuleProperties = {
  _create: {
    configurable: boolean;
    enumerable: boolean;
    value: Creator;
    writable: boolean;
  };
  _onRelease?: {
    configurable: boolean;
    enumerable: boolean;
    value: Handler;
    writable: boolean;
  };
  _onReserve?: {
    configurable: boolean;
    enumerable: boolean;
    value: Handler;
    writable: boolean;
  };
  entries: {
    configurable: boolean;
    enumerable: boolean;
    value: WeakMap<Entry, string>;
    writable: boolean;
  };
  name: {
    configurable: boolean;
    enumerable: boolean;
    value: string;
    writable: boolean;
  };
  stack: {
    configurable: boolean;
    enumerable: boolean;
    value: Entry[];
    writable: boolean;
  };
};
