module.exports = function waitSync(delay = 1000) {

  const start = Date.now();

  while (true) {

    const now = Date.now();
    const stop = now - start >= delay;

    if (stop) return;

  }

}