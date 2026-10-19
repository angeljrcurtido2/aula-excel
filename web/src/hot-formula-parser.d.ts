declare module 'hot-formula-parser' {
  export class Parser {
    constructor();
    on(evento: string, cb: (...args: any[]) => void): void;
    parse(f: string): { error: string | null; result: any };
    setFunction(nombre: string, fn: (params: any[]) => any): void;
  }
}
