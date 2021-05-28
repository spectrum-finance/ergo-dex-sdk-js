import test from 'ava';

import { RustModule } from './rustLoader';

test('rustLoader', async (t) => {
  t.falsy(RustModule.SigmaRust);
  await t.notThrowsAsync(() => RustModule.load('ergo-lib-wasm-nodejs'));
  t.truthy(RustModule.SigmaRust);
});
