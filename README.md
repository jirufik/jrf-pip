# jrf-pip (parallel iteration processing)

**jrf-pip** - This is a package for parallel iterative processing of large arrays.
Allows parallel processing asynchronously,
or asynchronously in synchronous style. Processing implemented through Promise.all()

## Example

```js
const parallelProcessing = require('jrf-pip');

// Send a message to group users
async function sendMesToGroupUsers() {

  // Generate groups of 10,000 users.
  // 5000 female
  // 5000 males
  const groupUsers = generateUsers();

  // Filter Function
  // Skip Male Users
  // i.e. send message only to female
  const nextValueFn = ({value, index, arrayValues, iteration}) => {
    return value.sex === 'male';
  };

  // Processing Function
  // Send a message
  const processingFn = ({value, index, arrayValues, iteration}) => {
    const user = value;
    user.sendMes(iteration);
  };

  // Callback function. It will work after the completion of sending the message.
  const cb = (stackError) => console.log('Finish parallel iteration processing');

  // Starting parallel iterative processing
  // An array of arrayValues is specified for processing
  // filter function nextValueFn specified
  // the processing function of the processingFn array element is specified
  // a callback function is set that will be executed when parallel processing is completed
  // set the number of 1000 parallel processed array values through Promise.all()
  await parallelProcessing({
    arrayValues: groupUsers,
    nextValueFn,
    processingFn,
    cb,
    parallel: 1000
  });

  console.log('Before finish');

}

// Send a message to the users of the group in a synchronous style
async function sendMesToGroupUsersSyncStyle() {

  // Generate groups of 10,000 users.
  // 5000 female
  // 5000 males
  const groupUsers = generateUsers();

  // Filter Function
  // Skip Male Users
  // i.e. send message only to female
  const nextValueFn = ({value, index, arrayValues, iteration}) => {
    return value.sex === 'male';
  };

  // Processing Function
  // Send a message
  const processingFn = ({value, index, arrayValues, iteration}) => {
    const user = value;
    user.sendMes(iteration);
  };

  // Starting parallel iterative processing
  // An array of arrayValues is specified for processing
  // filter function nextValueFn specified
  // the processing function of the processingFn array element is specified
  // the awaitRes response wait parameter is specified i.e. synchronous execution
  // set the number of 2000 parallel values of the array through Promise.all()
  // time of cycleTimeout of an asynchronous pause between iterations is set
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

## Parameters

The **parallelProcessing** function at the input accepts the following parameters:

| name | type | required | default | description |
| --- | --- | --- | --- | --- |
| arrayValues | array | true | | An array of values to process |
| processingFn | function | true | | A synchronous or asynchronous function that processes an array element. The input accepts parameters **paramsForFunction** |
| nextValueFn | function | false | | A synchronous or asynchronous function that performs filtering. If it returns **true**, then the current element of the array will not be processed. **false** - the current element of the array will be processed. The input accepts parameters **paramsForFunction** |
| parallel | number | false | 1000 | Number of elements to be processed in parallel per iteration |
| awaitRes | boolean | false | false | Expect an answer i.e. wait for completion to complete in synchronous style |
| cb | function | false | | A synchronous or asynchronous callback function, will work if `awaitRes = false`. An error stack will be passed to the function **stackError** |
| cycleTimeout | number | false | 200 | Asynchronous pause between iterations (milliseconds), for `awaitRes = true` |

## paramsForFunction

Parameters passed to the **processingFn** and **nextValueFn** function

| name | type | description |
| --- | --- | --- |
| value | any | Array element to process |
| index | number | Array element index |
| arrayValues | array | Array |
| iteration | number | Iteration number |

## stackError

An error stack returned with `awaitRes = true`, or passed to a function
callback when `awaitRes = false`.

Array of objects:

| name | type | description |
| --- | --- | --- |
| value | any | Array element during processing of which an error occurred |
| index | number | Array element index |
| iteration | number | Iteration number |
| error | object | Error |