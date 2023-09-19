// debounce only returns an arrow function expression that handles the delay and call to the callback func "onInput"
// kind of a gatekeeper function wrapper around the onInput that calls fetchData
const debounce = (func, delay = 1000) => {
  let timeoutId;
  // while debounce returns an arrow function that is defined with ...args parameter.
  // The event object
  // pass in the event in args.  gets passed down to the callback func (onInput),. which is
  //When the wrapped function (onInput) is executed by setTimeout(),
  //the arguments supplied by the previous function call (event object) will be passed as an argument to the original function (onInput).
  //the "input" event data gets passed as the event argument to the onInput function through the use of debounce.
  return (...args) => {
    if (timeoutId) {
      clearInterval(timeoutId);
    }
    timeoutId = setTimeout(() => {
      // run onInput with this=null and args as an array
      func.apply(null, args);
    }, delay);
  };
};
