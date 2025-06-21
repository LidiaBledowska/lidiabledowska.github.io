(function(global){
  const isProduction = !['localhost', '127.0.0.1'].includes(global.location.hostname);
  function log(...args){
    if(!isProduction){
      console.log(...args);
    }
  }
  function error(...args){
    if(!isProduction){
      console.error(...args);
    }
  }
  global.appLogger = { log, error };
})(window);
