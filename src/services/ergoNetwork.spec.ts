import test from 'ava';

import { RustModule } from '../utils/rustLoader';

import { Explorer } from './ergoNetwork';

test.before(async () => {
  await RustModule.load('ergo-lib-wasm-nodejs');
});

test('ergoNetwork', (t) => {
  t.truthy(new Explorer('https://example.com'));
});
