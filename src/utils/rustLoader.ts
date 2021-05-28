export type SigmaRust = typeof import('ergo-lib-wasm-browser');

type library = 'ergo-lib-wasm-browser' | 'ergo-lib-wasm-nodejs';

class Module {
  _ergo?: SigmaRust;

  async load(customLibraryPath: library = 'ergo-lib-wasm-browser'): Promise<SigmaRust> {
    if (this._ergo === undefined) {
      this._ergo = await import(customLibraryPath);
    }
    return this._ergo!;
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get SigmaRust(): SigmaRust {
    return this._ergo!;
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module();
