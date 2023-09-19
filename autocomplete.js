// destructure properties and functions from the passed in movie app spesific config object.
const createAutoCompleteWidget = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
  details,
}) => {
  console.log(details);
  // reduce decoupling with the .html file by writing some generic search related markup here
  root.innerHTML = `<div class="dropdown">
      <label>Hae</label>      
      <input />
      <div class="dropdown-menu">
        <div class="dropdown-content results">
        </div>
      </div>
      </div>
    <div id="summary"></div>`;
  // narrow the selector only to the passed in root element
  const input = root.querySelector("input");
  // need to have the some of the html elements as variable in order to reference it while appending elements into it
  const dropdown = root.querySelector(".dropdown");
  const resultsWrapper = root.querySelector(".results");
  let searchResponse;

  /* comment out for no movie spesific functinality inside the widget
  const onMovieSelect = async (movie) => {
    console.log(movie);
    const selectedOptionData = await new axios.get("https://omdbapi.com", {
      params: {
        apikey: "c3945f09",
        //i: "tt0803093", // movie id
        //s: "avengers", // search by title
        i: movie.imdbID,
      },
    });
    //console.log(selectedOptionData);
    //console.log(root);
    // use innerHTML to add a lot of HTML.
    // appendChild would require to have each of these as created Node elements.
    // in practice the nested html of movieDetails would need to be added to the innerHTML of the created element anyways
    root.querySelector("#summary").innerHTML = details(selectedOptionData.data);
  };*/

  //debounce needs the async declaration for await is used inside
  const onInput = debounce(async (event) => {
    const fetchedItems = await fetchData(event.target.value, "s");
    // 0 equals to !length
    if (!fetchedItems.length) {
      dropdown.classList.remove("is-active");
      resultsWrapper.innerHTML = "";
      return;
    }
    // once fetched, clear prior content and set some css to display the whole list
    resultsWrapper.innerHTML = "";
    dropdown.classList.add("is-active");

    for (let item of fetchedItems) {
      // use clickable links as drop down items
      const dropDownOption = document.createElement("a");
      dropDownOption.innerHTML = renderOption(item);
      dropDownOption.classList.add("dropdown-item");
      dropDownOption.addEventListener("click", (event) => {
        dropdown.classList.remove("is-active");
        input.value = inputValue(item);
        onOptionSelect(item);
      });

      // append one element at a time
      resultsWrapper.appendChild(dropDownOption);
    }
  });

  // basic implementation: pass in onInput function as callback. it automatically receives the event
  // this works because onInput refers to / is a function expression, aka it runs debounce with the event as parameter
  //input.addEventListener("input", onInput);

  // advanced implemenation: use the debounce wrapper function expression which takes
  // the onInput argument as the event handler callback and returns a function
  // that wraps the delay logic around the onInput

  // addEventListener() automatically passes the event to debounce,
  // which returns a function expression wrapping around the onInput function
  // when this wrapped function onInput is executed,
  // the arguments supplied by the previous function call (event object) will be passed
  // as an argument to the original function (onInput).

  const delay = 500;
  input.addEventListener("input", debounce(onInput, delay));
  document.addEventListener("click", (event) => {
    // Node.contains can be passed the whole element, checks children also.
    // Way more robust and less code than clicked classname validation classList.contains("className")
    if (!root.contains(event.target)) {
      dropdown.classList.remove("is-active");
      resultsWrapper.innerHTML = "";
    }
  });
};
