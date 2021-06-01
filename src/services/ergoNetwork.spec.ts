import test from 'ava';

import {RustModule} from '../utils/rustLoader';

import {Explorer} from './ergoNetwork';

test.before(async () => {
    await RustModule.load(true);
})

test('ergoNetwork getUnspentByErgoTree', async (t) => {
    const explorer = new Explorer('https://api.ergoplatform.com/api/v1')
    await t.notThrowsAsync(explorer.getUnspentByErgoTree(
        "0008cd028ed8375cdff4f9e686f95a76ee3a14ab4536b417c49d6de4a7c6c635bf1ec8aa",
        {offset: 0, limit: 10}))
})
