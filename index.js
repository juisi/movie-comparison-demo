// functionality in index.js are application spesific and named accordingly
const movieTemplate = (movie) => {
  console.log("run details() with a passed in movie: ", movie);
  const boxOfficeDollars = parseInt(
    movie.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movie.Metascore);
  const imdbRating = parseFloat(movie.imdbRating);
  const imdbVotes = parseInt(movie.imdbVotes.replace(/,/g, ""));
  let totalNominationPoints = movie.Awards.split(" ").reduce(
    (count, word) => {
      let value = parseInt(word);
      if (isNaN(value)) {
        return count;
      }
      return count + value;
    },
    0 // initial count value
  );
  const imgUrl = movie.Poster === "N/A" ? "" : movie.Poster;
  return `
      <article class="media">
        <figure class="media">
          <p class="image">
            <img src="${imgUrl}"/>
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h1>${movie.Title}</h1>
            <h4>${movie.Genre}</h4>
            <p>${movie.Plot}</p>
          </div>
        </div>
      </article>
      <article data-value=${totalNominationPoints} class="notification is-primary">
        <p class="title">${movie.Awards}</p>
        <p class="subtitle">Awards</p>
      </article>
      <article data-value=${boxOfficeDollars} class="notification is-primary">
        <p class="title">${movie.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
      </article>
      <article data-value=${metascore} class="notification is-primary">
        <p class="title">${movie.Metascore}</p>
        <p class="subtitle">Metascore</p>
      </article>
      <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movie.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
      </article>
      <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movie.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
      </article>
      `;
};
let leftMovie, rightMovie;

// movie select should be application spesific and not defined inside the autocomplete widget
const onMovieSelect = async (movie, targetElement, callContext) => {
  console.log(movie);
  const response = await new axios.get("https://omdbapi.com", {
    params: {
      apikey: "c3945f09",
      //i: movie id
      //s: search by title
      i: movie.imdbID,
    },
  });

  console.log(response.data);
  // use innerHTML to add a lot of HTML.
  // appendChild would require to have each of these as created Node elements.
  // in practice the nested html of movieDetails would need to be added to the innerHTML of the created element anyways
  targetElement.innerHTML = movieTemplate(response.data);
  if (callContext === "right") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if (rightMovie && leftMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftArticles = document.querySelectorAll("#left-summary .notification");
  const rightArticles = document.querySelectorAll(
    "#right-summary .notification"
  );
  leftArticles.forEach((leftSideElement, index) => {
    const leftSideValue = parseFloat(leftSideElement.dataset.value);
    const rightSideValue = parseFloat(rightArticles[index].dataset.value);
    if (leftSideValue < rightSideValue) {
      leftSideElement.classList.remove("is-primary");
      leftSideElement.classList.add("is-warning");
    } else {
      rightArticles[index].classList.remove("is-primary");
      rightArticles[index].classList.add("is-warning");
    }
    console.log(leftSideValue, rightSideValue);
  });
};
// TODO: generalize query functionality based on searchType
// receives the original text input event value, calling and passing in fetchData(event.target.value);
/*const fetchData = async (searchTerm, searchType, ...args) => {
  // so far nothing to do with the destructured args
  const response = await new axios.get("https://omdbapi.com", {
    params: {
      apikey: "c3945f09",
      //i: "tt0803093", // movie id
      //s: "avengers", // search by title
      [searchType]: searchTerm,
    },
  });
  console.log(response);
  if (response.data.Error) {
    return [];
  }
  if (searchType === "s") {
    return response.data.Search;
  }
  return response.data;
};*/

const autoCompleteConfig = {
  // no practical difference using arrow or object method syntax
  renderOption: (movie) => {
    // validate image url by a ternary operator
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    // use backticks for a multi line string. quotes would throw error
    return `
    <img src="${imgSrc}" />
    ${movie.Title} (${movie.Year})
    `;
  },
  inputValue: (movie) => {
    return movie.Title;
  },
  async fetchData(searchTerm, searchType) {
    const response = await new axios.get("https://omdbapi.com", {
      params: {
        apikey: "c3945f09",
        //i: "tt0803093", // movie id
        //s: "avengers", // search by title
        [searchType]: searchTerm,
      },
    });
    console.log(response);
    if (response.data.Error) {
      return [];
    }
    if (searchType === "s") {
      return response.data.Search;
    }
    return response.data;
  },
};

// create 2 instances of the auto complete widget - that share the autoCompleteConfig but have some unique configurations
const leftWidget = createAutoCompleteWidget({
  // copy the generic config object into both widgets
  ...autoCompleteConfig,
  // unique root and selection elements for each widget
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect: (movie) => {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});
const rightWidget = createAutoCompleteWidget({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect: (movie) => {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});
