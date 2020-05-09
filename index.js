const wait = require('./utils/wait');
const funcIsAsync = require('./utils/funcIsAsync');

/**
 * Parallel processing of elements of an array of values
 * Параллельная обработка элементов массива значений
 *
 * @param {array} arrayValues - Array of values for parallel processing
 *                              Массив значений для параллельной обработки
 * @param {function} processingFn - A synchronous or asynchronous function that processes an array element
 *                                  Синхронная или асинхронная функция, выполняющая обработку элемента массива
 * @param {function} [nextValueFn] - A synchronous or asynchronous function that filters arrayValues
 *                                   Синхронная или асинхронная функция, выполняющая фильтрацию arrayValues
 * @param {number} [parallel = 1000] - The number of parallel processed elements per iteration
 *                                     Количество параллельно обрабатываемых элементов за итерацию
 * @param {boolean} [awaitRes = false] - Expect an answer i.e. wait for completion to complete in synchronous style
 *                                       Ожидать ответ т.е. ждать завершение выполнения в синхронном стиле
 * @param {function} [cb] - Synchronous or asynchronous callback function, will work if awaitRes = false.
 *                          An error stack will be passed to the function.
 *                          Синхронная или асинхронная функция обратного вызова, отработает если awaitRes = false.
 *                          В функцию будет передан стек ошибок.
 * @param {number} [cycleTimeout = 200] - Asynchronous pause between iterations (milliseconds), for awaitRes = true
 *                                        Асинхронная пауза между итерациями (миллисекунды), для awaitRes = true
 * @return {Promise<*>} - Will return an error stack if awaitRes = true
 *                        Вернет стек ошибок, если awaitRes = true
 */
async function parallelProcessing({
                                    arrayValues,
                                    processingFn,
                                    nextValueFn,
                                    cycleTimeout = 200,
                                    parallel = 1000,
                                    awaitRes = false,
                                    cb
                                  }) {

  const isBadArray = !Array.isArray(arrayValues);
  if (isBadArray) throw new Error('Bad array values');

  const isBadFn = !processingFn || typeof processingFn !== 'function';
  if (isBadFn) throw new Error('Bad processing function');

  const stackError = [];

  // An array element to start parallel processing from
  // Элемент массива с которого начать параллельную обработку
  let first = 0;
  // Iteration number
  // Номер итерации
  let i = 1;

  const processing = async () => {

    const promises = [];

    // The final element of parallel processing
    // Конечный элемент параллельной обработки
    const last = Math.min(i * parallel, arrayValues.length);
    for (let j = first; j < last; j++) {

      const value = arrayValues[j];
      const params = {value, index: j, arrayValues, iteration: i};

      let next = false;

      // If a filter function is specified, execute it
      // true - take the next element of the array for processing
      // false - continue processing this array element
      // Если задана функция фильтрации выполняем ее
      // true - берем следующий элемент массива в обработку
      // false - продолжаем обработку данного элемента массива
      const isNextFn = nextValueFn && typeof nextValueFn === 'function';
      if (isNextFn) {

        const isAsync = funcIsAsync(nextValueFn);
        if (isAsync) {
          next = await nextValueFn(params);
        } else {
          next = nextValueFn(params);
        }

      }

      if (next) continue;

      // Fill An Array Of Parallel Jobs
      // Заполняем массив параллельных заданий
      let promise = null;
      const isAsync = funcIsAsync(processingFn);
      if (isAsync) {

        // If processFn is an asynchronous function
        // Если processFn асинхронная функция
        promise = processingFn(params).catch(e => stackError.push({
          value,
          index: j,
          iteration: i,
          error: e
        }));

        promises.push(promise);

      } else {

        // If processFn is a synchronous function
        // Если processFn синхронная функция
        promise = async () => {
          try {
            processingFn(params);
          } catch (e) {
            stackError.push({
              value,
              index: j,
              iteration: i,
              error: e
            });
          }
        };

        promises.push(promise());

      }

    }

    // Perform parallel processing
    // Выполняем параллельную обработку
    await Promise.all(promises);

    // If we processed all the elements, we end the parallel processing
    // Если обработали все элементы завершаем работу параллельной обработки
    const stop = last >= arrayValues.length;
    if (stop) {

      // If asynchronous execution is in synchronous style
      // Если асинхронное выполнение в синхронном стиле
      if (awaitRes) return stackError;

      // If asynchronous execution
      // Если асинхронное выполнение
      const isFn = cb && typeof cb === 'function';
      if (isFn) {

        const isAsync = funcIsAsync(cb);
        if (isAsync) {
          await cb(stackError);
        } else {
          cb(stackError);
        }

      }

      return;

    }

    // Go to the next group of parallel processing
    // Переход к следующей группе параллельной обработки
    i++;
    first = last;

    // Pause asynchronously
    // Делаем асинхронную паузу
    if (awaitRes) {

      await wait(cycleTimeout);
      return await processing();

    } else {

      setImmediate(async () => await processing());

    }

  }

  if (awaitRes) {
    return await processing();
  } else {
    setImmediate(async () => await processing());
  }

}

module.exports = parallelProcessing;