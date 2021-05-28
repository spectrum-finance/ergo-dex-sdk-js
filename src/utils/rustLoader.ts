export type SigmaRust = typeof import('ergo-lib-wasm-browser');

class Module {
  _ergo?: SigmaRust;

  async load(): Promise<void> {
    if (this._ergo !== undefined) {
      return;
    }
    this._ergo = await import('ergo-lib-wasm-browser');
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get SigmaRust(): SigmaRust {
    return this._ergo!;
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module();
