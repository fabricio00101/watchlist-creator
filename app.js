const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResultsContainer = document.getElementById("search-results");
const newListForm = document.getElementById("new-list-form");
const newListInput = document.getElementById("new-list-input");
const watchlistsContainer = document.getElementById("watchlists-container");

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNjA0OWM2ODliOTMwY2U2NmRkYWY4ZGI0NjBkOTJlYyIsIm5iZiI6MTc2MTc1NzQ5My42ODEsInN1YiI6IjY5MDI0OTM1NzViZThjMWJjYWM1NjQzNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aOlNMQMwtJQ3kFabJ34zqtyPYJFT8FOd_-Tuaxg31nE"

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

let watchlists = [] ;

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    
    if(query){
        searchMovies(query)
    }
});

newListForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const listName = newListInput.value.trim();
    if (listName){
        createNewList(listName);
        newListInput.value = "";
    }
})

function createNewList(listName){
    const newList = {
        name: listName,
        movies: []
    }
    watchlists.push(newList);

    saveWatchlistToLocalStorage();
    renderWatchlists();
}
function deleteList(listName){
    const listIndex = watchlists.findIndex(list => list.name === listName);
    if (listIndex > -1){
        watchlists.splice(listIndex, 1);
        saveWatchlistToLocalStorage();
        renderWatchlists();
    }
}
function saveWatchlistToLocalStorage(){
    localStorage.setItem("movieWatchlists", JSON.stringify(watchlists));
}
function loadWatchlistFromLocalStorage(){
    const storedWatchlists = localStorage.getItem("movieWatchlists")
    if (storedWatchlists){
        watchlists = JSON.parse(storedWatchlists);
    }
    renderWatchlists();
}
async function searchMovies(query) {
    searchResultsContainer.innerHTML = "<p>Buscando...</p>";
    try{
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=es-ES`,{
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": 'application/json;charset=utf-8'
                }
            }
        )
        if(!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }
        const data = await response.json();
        displaySearchResults(data.results);
    }catch(error){
        console.error("Error al buscar películas:", error);
        searchResultsContainer.innerHTML = "<p>No se pudieron cargar los resultados</p>";

    }
    
}
function displaySearchResults(movies){
        searchResultsContainer.innerHTML = "";
        if(movies.length === 0){
            searchResultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
            return;
        }
        movies.forEach(movie =>{
            if (!movie.poster_path)return;

            const movieCard = document.createElement("article");
            movieCard.className = "movie-card"

            const movieImage = document.createElement("img");
            movieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            movieImage.alt = movie.title;

            const movieTitle = document.createElement("h4");
            movieTitle.textContent = movie.title;

            const addToListSelect = document.createElement("select");
            addToListSelect.className = "add-to-list-btn";

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Añadir a...";
            addToListSelect.appendChild(defaultOption);

            watchlists.forEach(list => {
                const option = document.createElement("option");
                option.value = list.name;
                option.textContent = list.name;
                addToListSelect.appendChild(option);
            })
            addToListSelect.addEventListener("change", (event) =>{
                const selectedListName = event.target.value;
                if (selectedListName){
                    const movieData = {
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path
                    }
                    addMovieToList(selectedListName, movieData);
                    event.target.value = "";
                }
            })
            movieCard.appendChild(movieImage);
            movieCard.appendChild(movieTitle);
            movieCard.appendChild(addToListSelect);
            searchResultsContainer.appendChild(movieCard);
        })
    }

function addMovieToList(listName, movieData){
    const list = watchlists.find(list => list.name === listName);
    if(!list) return;
    
    const movieExists = list.movies.find(movie => movie.id === movieData.id);
    if (movieExists){
        alert(`"${movieData.title}" ya está en tu lista "${listName}".`);   return; 
    }
    list.movies.push(movieData);
    saveWatchlistToLocalStorage();
    renderWatchlists();
}
function renderWatchlists(){
    watchlistsContainer.innerHTML = "";
        watchlists.forEach(list =>{
            const listElement = document.createElement("article");
            listElement.className = "watchlist";

            const listHeader =document.createElement("div");
            listHeader.className = "watchlist-header";

            const listTitle = document.createElement("h3");
            listTitle.textContent = list.name;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.className = "delete-btn";
            deleteButton.addEventListener("click",() =>{
                deleteList(list.name)
            })
            listHeader.appendChild(listTitle)
            listHeader.appendChild(deleteButton)

            const moviesGrid = document.createElement("div");
            moviesGrid.className = "grid";

            if (list.movies.length === 0){
                const emptyText = document.createElement("p");
                emptyText.textContent = "Esta lista está vacía.";
                moviesGrid.appendChild(emptyText);

            } else{
                list.movies.forEach(movie =>{
                    const movieCard = document.createElement("article");
                    movieCard.className = "movie-card";
                    const movieImage = document.createElement("img");
                    movieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                    movieImage.alt = movie.title;

                    const movieTitle = document.createElement("h4");
                    movieTitle.textContent = movie.title;

                    movieCard.appendChild(movieImage)
                    movieCard.appendChild(movieTitle)
                    moviesGrid.appendChild(movieCard)
                })
            }
            listElement.appendChild(listHeader);
            listElement.appendChild(moviesGrid);
            watchlistsContainer.appendChild(listElement)
        })
    }







        loadWatchlistFromLocalStorage()
