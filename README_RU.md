# jrf-pip (parallel iteration processing)

**jrf-pip** - это пакет для параллельной итерационной обработки больших массивов.
Позволяющий выполнять параллельную обработку асинхронно, 
или асинхронно в синхронном стиле. Обработка реализована через Promise.all()

## Пример

```js
const parallelProcessing = require('jrf-pip');

// Отправим сообщение пользователям группы
async function sendMesToGroupUsers() {

  // Сгенерируем группы из 10000 пользователей.
  // 5000 женского пола
  // 5000 мужского пола
  const groupUsers = generateUsers();

  // Функция фильтрации
  // Пропустим пользователей мужского пола
  // т.е. сообщение отправим только женскому полу
  const nextValueFn = ({value, index, arrayValues, iteration}) => {
    return value.sex === 'male';
  };

  // Функция обработки
  // Отправим сообщение
  const processingFn = ({value, index, arrayValues, iteration}) => {
    const user = value;
    user.sendMes(iteration);
  };

  // Функция обратного вызова. Отработает после завершения отправки сообщения.
  const cb = (stackError) => console.log('Finish parallel iteration processing');

  // Запуск параллельной итерационной обработки
  // задана массив значений arrayValues для обработки
  // задана функция фильтрации nextValueFn
  // задана функция обработки элемента массива processingFn
  // задана функция обратного вызова, которая выполнится при завершении параллельной обработки
  // задано количество 1000 параллельно обрабатываемых значений массива через Promise.all()
  await parallelProcessing({
    arrayValues: groupUsers,
    nextValueFn,
    processingFn,
    cb,
    parallel: 1000
  });

  console.log('Before finish');

}

// Отправим сообщение пользователям группы в синхронном стиле
async function sendMesToGroupUsersSyncStyle() {

  // Сгенерируем группы из 10000 пользователей.
  // 5000 женского пола
  // 5000 мужского пола
  const groupUsers = generateUsers();

  // Функция фильтрации
  // Пропустим пользователей мужского пола
  // т.е. сообщение отправим только женскому полу
  const nextValueFn = ({value, index, arrayValues, iteration}) => {
    return value.sex === 'male';
  };

  // Функция обработки
  // Отправим сообщение
  const processingFn = ({value, index, arrayValues, iteration}) => {
    const user = value;
    user.sendMes(iteration);
  };

  // Запуск параллельной итерационной обработки
  // задана массив значений arrayValues для обработки
  // задана функция фильтрации nextValueFn
  // задана функция обработки элемента массива processingFn
  // задан параметр ожидания ответа awaitRes т.е. выполнение в синхронном стиле
  // задано количество 2000 параллельно обрабатываемых значений массива через Promise.all()
  // задано время cycleTimeout асинхронной паузы между итерациями
  const stackError = await parallelProcessing({
    arrayValues: groupUsers,
    nextValueFn,
    processingFn,
    awaitRes: true,
    parallel: 2000,
    cycleTimeout: 100
  });

  console.log('Finish parallel iteration processing in sync style');

}

function generateUsers(count = 10000) {

  const groupUsers = [];

  const even = n => !(n % 2);
  for (let i = 1; i <= count; i++) {

    const sex = even(i) ? 'male' : 'female';
    groupUsers.push({
      id: i,
      sex,
      sendMes(iteration) {
        console.log(`send mes to user id: ${this.id} sex: ${this.sex} iteration: ${iteration}`);
      }
    });

  }

  return groupUsers;

}

Promise.resolve()
  .then(sendMesToGroupUsers)
  .then(sendMesToGroupUsersSyncStyle)
  .catch(e => console.error(e));
```

## Параметры

Функция **parallelProcessing** на входе принимает следующие параметры:

| name | type | required | default | description |
| --- | --- | --- | --- | --- |
| arrayValues | array | true | | Массив значений который требуется обработать |
| processingFn | function | true | | Синхронная или асинхронная функция, выполняющая обработку элемента массива. На входе принимает параметры **paramsForFunction** |
| nextValueFn | function | false | | Синхронная или асинхронная функция, выполняющая фильтрацию. Если вернет **true** - то текущий элемент массива не будет обработан. **false** - текущий элемент массива будет обработан. На входе принимает параметры **paramsForFunction** |
| parallel | number | false | 1000 | Количество параллельно обрабатываемых элементов за итерацию |
| awaitRes | boolean | false | false | Ожидать ответ т.е. ждать завершение выполнения в синхронном стиле |
| cb | function | false | | Синхронная или асинхронная функция обратного вызова, отработает если `awaitRes = false`. В функцию будет передан стек ошибок **stackError** |
| cycleTimeout | number | false | 200 | Асинхронная пауза между итерациями (миллисекунды), для `awaitRes = true` |

## paramsForFunction

Параметры передаваемые в функцию **processingFn** и **nextValueFn**

| name | type | description |
| --- | --- | --- |
| value | any | Обрабатываемый элемент массива |
| index | number | Индекс элемента массива |
| arrayValues | array | Массив |
| iteration | number | Номер итерации |

## stackError

Стек ошибок возвращаемый при `awaitRes = true`, или передаваемый в функцию
обратного вызова при `awaitRes = false`. 

Массив объектов:

| name | type | description |
| --- | --- | --- |
| value | any | Элемент массива при обработке которого произошла ошибка |
| index | number | Индекс элемента массива |
| iteration | number | Номер итерации |
| error | object | Ошибка |