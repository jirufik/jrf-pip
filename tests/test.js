const wait = require('../utils/wait');
const waitSync = require('../utils/waitSync');
const parallelProcessing = require('../index');
const fs = require('fs');

describe('processingFn is async and awaitRes is true', () => {

  test('5 array values', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5];

    const processingFn = async ({value, index, arrayValues, iteration}) => {
      process.push(value);
      await wait(100);
    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, processingFn, awaitRes: true});

    const finish = Date.now();
    const diff = finish - start;

    expect(process.length === 5).toBeTruthy();
    expect(diff >= 100).toBeTruthy();
    expect(diff <= 150).toBeTruthy();

  });

  test('10 array values; parallel: 5', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const processingFn = async ({value, index, arrayValues, iteration}) => {
      process.push(value);
      iterationCount = iteration;
      await wait(100);
    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, processingFn, awaitRes: true, parallel: 5});

    const finish = Date.now();
    const diff = finish - start;

    expect(process.length === 10).toBeTruthy();
    expect(iterationCount === 2).toBeTruthy();
    expect(diff >= 400).toBeTruthy();
    expect(diff <= 500).toBeTruthy();

  });

  test('10 array values; parallel: 5; error', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const processingFn = async ({value, index, arrayValues, iteration}) => {
      process.push(value);
      iterationCount = iteration;
      await wait(100);
      if (index === 3) throw new Error('test error');
    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, processingFn, awaitRes: true, parallel: 5});

    const finish = Date.now();
    const diff = finish - start;

    expect(res.length === 1).toBeTruthy();
    expect(process.length === 10).toBeTruthy();
    expect(iterationCount === 2).toBeTruthy();
    expect(diff >= 400).toBeTruthy();
    expect(diff <= 500).toBeTruthy();

  });

  test('10 array values; parallel: 5; next 5 value', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const nextValueFn = ({value, index, arrayValues, iteration}) => {
      return value === 5;
    }

    const processingFn = async ({value, index, arrayValues, iteration}) => {

      process.push(value);
      iterationCount = iteration;

      await wait(100);

    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, nextValueFn, processingFn, awaitRes: true, parallel: 5});

    const finish = Date.now();
    const diff = finish - start;

    expect(process.length === 9).toBeTruthy();
    expect(iterationCount === 2).toBeTruthy();
    expect(diff >= 400).toBeTruthy();
    expect(diff <= 500).toBeTruthy();

  });

});

describe('processingFn is not async and awaitRes is true', () => {

  test('5 array values', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5];

    const processingFn = ({value, index, arrayValues, iteration}) => {
      process.push(value);
      waitSync(100);
    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, processingFn, awaitRes: true});

    const finish = Date.now();
    const diff = finish - start;

    expect(process.length === 5).toBeTruthy();
    expect(diff >= 500).toBeTruthy();
    expect(diff <= 550).toBeTruthy();

  });

  test('10 array values; parallel: 5', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const processingFn = ({value, index, arrayValues, iteration}) => {
      process.push(value);
      iterationCount = iteration;
      waitSync(100);
    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, processingFn, awaitRes: true, parallel: 5});

    const finish = Date.now();
    const diff = finish - start;

    expect(process.length === 10).toBeTruthy();
    expect(iterationCount === 2).toBeTruthy();
    expect(diff >= 1100).toBeTruthy();
    expect(diff <= 1300).toBeTruthy();

  });

  test('10 array values; parallel: 5; error', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const processingFn = ({value, index, arrayValues, iteration}) => {
      process.push(value);
      iterationCount = iteration;
      waitSync(100);
      if (index === 3) throw new Error('test error');
    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, processingFn, awaitRes: true, parallel: 5});

    const finish = Date.now();
    const diff = finish - start;

    expect(res.length === 1).toBeTruthy();
    expect(process.length === 10).toBeTruthy();
    expect(iterationCount === 2).toBeTruthy();
    expect(diff >= 1100).toBeTruthy();
    expect(diff <= 1300).toBeTruthy();

  });

  test('10 array values; parallel: 5; next 5 value', async () => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const nextValueFn = async ({value, index, arrayValues, iteration}) => {
      return value === 5;
    }

    const processingFn = ({value, index, arrayValues, iteration}) => {

      process.push(value);
      iterationCount = iteration;

      waitSync(100);

    };

    const start = Date.now();

    const res = await parallelProcessing({arrayValues, nextValueFn, processingFn, awaitRes: true, parallel: 5});

    const finish = Date.now();
    const diff = finish - start;

    expect(process.length === 9).toBeTruthy();
    expect(iterationCount === 2).toBeTruthy();
    expect(diff >= 1100).toBeTruthy();
    expect(diff <= 1300).toBeTruthy();

  });

});

describe('processingFn is async and awaitRes is false', () => {

  test('5 array values', async (done) => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5];

    const processingFn = async ({value, index, arrayValues, iteration}) => {
      process.push(value);
      await wait(100);
    };

    const start = Date.now();

    const cb = (stackError) => {

      const finish = Date.now();
      const diff = finish - start;

      expect(process.length === 5).toBeTruthy();
      expect(diff >= 100).toBeTruthy();
      expect(diff <= 150).toBeTruthy();

      done();

    };

    await parallelProcessing.call(this, {arrayValues, processingFn, cb});

  });

  test('10 array values; parallel: 5', async (done) => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const processingFn = async ({value, index, arrayValues, iteration}) => {
      process.push(value);
      iterationCount = iteration;
      await wait(100);
    };

    const start = Date.now();

    const cb = (stackError) => {

      const finish = Date.now();
      const diff = finish - start;

      expect(process.length === 10).toBeTruthy();
      expect(iterationCount === 2).toBeTruthy();
      expect(diff >= 200).toBeTruthy();
      expect(diff <= 500).toBeTruthy();

      done();

    };

    await parallelProcessing({arrayValues, processingFn, cb, parallel: 5});

  });

  test('10 array values; parallel: 5; error', async (done) => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const processingFn = async ({value, index, arrayValues, iteration}) => {
      process.push(value);
      iterationCount = iteration;
      await wait(100);
      if (index === 3) throw new Error('test error');
    };

    const start = Date.now();

    const cb = (stackError) => {

      const finish = Date.now();
      const diff = finish - start;

      expect(stackError.length === 1).toBeTruthy();
      expect(process.length === 10).toBeTruthy();
      expect(iterationCount === 2).toBeTruthy();
      expect(diff >= 200).toBeTruthy();
      expect(diff <= 500).toBeTruthy();

      done();

    };

    await parallelProcessing({arrayValues, processingFn, cb, parallel: 5});

  });

  test('10 array values; parallel: 5; next 5 value', async (done) => {

    const process = [];
    const arrayValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let iterationCount = 0;

    const nextValueFn = ({value, index, arrayValues, iteration}) => {
      return value === 5;
    }

    const processingFn = async ({value, index, arrayValues, iteration}) => {

      process.push(value);
      iterationCount = iteration;

      await wait(100);

    };

    const start = Date.now();

    const cb = async (stackError) => {

      const finish = Date.now();
      const diff = finish - start;

      expect(process.length === 9).toBeTruthy();
      expect(iterationCount === 2).toBeTruthy();
      expect(diff >= 200).toBeTruthy();
      expect(diff <= 500).toBeTruthy();

      done();

    }

    await parallelProcessing({arrayValues, nextValueFn, processingFn, cb, parallel: 5});

  });

});