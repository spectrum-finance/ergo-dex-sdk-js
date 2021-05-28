import test from 'ava';

import { RustModule } from '../../utils/rustLoader';

import { ergoTreeFromAddress } from './ergoTree';

test.before(async () => {
  await RustModule.load('ergo-lib-wasm-nodejs');
})

test('ergoTreeFromAddress', async (t) => {
  t.notThrows(() => ergoTreeFromAddress('9gCuwqjXcxCP22JcTRgF4nUArP1LpUPVBVamdtTNQW6oLa7rmv5'));
});
