const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResultsContainer = document.getElementById("search-results");
const newListForm = document.getElementById("new-list-form");
const newListInput = document.getElementById("new-list-input");
const watchlistsContainer = document.getElementById("watchlists-container"); // in index.html
const misListasGrid = document.getElementById("mis-listas-grid"); // in mis_listas.html
const recentActivityTable = document.getElementById("recent-activity-table"); // in mis_listas.html

// Elementos de lista.html
const listTitleEl = document.getElementById("lista-titulo");
const listMetaEl = document.getElementById("lista-meta");
const listMoviesGrid = document.getElementById("list-movies-grid");
const listSearchForm = document.getElementById("list-search-form");
const listSearchInput = document.getElementById("list-search-input");
const listSearchSection = document.getElementById("list-search-section");
const listSearchResults = document.getElementById("list-search-results");
const closeSearchBtn = document.getElementById("close-search-btn");

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNjA0OWM2ODliOTMwY2U2NmRkYWY4ZGI0NjBkOTJlYyIsIm5iZiI6MTc2MTc1NzQ5My42ODEsInN1YiI6IjY5MDI0OTM1NzViZThjMWJjYWM1NjQzNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aOlNMQMwtJQ3kFabJ34zqtyPYJFT8FOd_-Tuaxg31nE"

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

let watchlists = [];

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();

        if (query) {
            // Check if we are on mis_listas.html by looking for the results container
            if (!searchResultsContainer) {
                // Redirect to index.html with query params
                window.location.href = `index.html?search=${encodeURIComponent(query)}#search-section`;
            } else {
                searchMovies(query);
                // Also scroll to search section
                document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

if (newListForm) {
    newListForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const listName = newListInput.value.trim();
        if (listName) {
            createNewList(listName);
            newListInput.value = "";
        }
    });
}

function createNewList(listName) {
    const newList = {
        name: listName,
        movies: []
    }
    watchlists.push(newList);

    saveWatchlistToLocalStorage();
    renderWatchlists();
}
function deleteList(listName) {
    const listIndex = watchlists.findIndex(list => list.name === listName);
    if (listIndex > -1) {
        watchlists.splice(listIndex, 1);
        saveWatchlistToLocalStorage();
        renderWatchlists();
    }
}
function saveWatchlistToLocalStorage() {
    localStorage.setItem("movieWatchlists", JSON.stringify(watchlists));
}
function loadWatchlistFromLocalStorage() {
    const storedWatchlists = localStorage.getItem("movieWatchlists");
    if (storedWatchlists) {
        watchlists = JSON.parse(storedWatchlists);
    }
    renderWatchlists();

    // Check si estamos en lista.html para cargar detalles
    const pathname = window.location.pathname;
    if (pathname.includes('lista.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const listNameParam = urlParams.get('list');

        const allListsView = document.getElementById('all-lists-view');
        const singleListView = document.getElementById('single-list-view');

        if (listNameParam) {
            // View single list
            if (allListsView) allListsView.classList.add('hidden');
            if (singleListView) singleListView.classList.remove('hidden');
            initListaPage(listNameParam);
        } else {
            // View all lists dashboard
            if (allListsView) allListsView.classList.remove('hidden');
            if (singleListView) singleListView.classList.add('hidden');
        }
    } else {
        // Logica existente para index.html search queries
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery && searchInput && searchResultsContainer) {
            searchInput.value = searchQuery;
            searchMovies(searchQuery);
            // Clean URL after search
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}
async function searchMovies(query, containerObj = null, displayCallback = null) {
    const container = containerObj || searchResultsContainer;
    if (container) container.innerHTML = "<p>Buscando...</p>";

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=es-ES`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": 'application/json;charset=utf-8'
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data = await response.json();

        if (displayCallback) {
            displayCallback(data.results);
        } else if (typeof displaySearchResults === 'function') {
            displaySearchResults(data.results);
        }

    } catch (error) {
        console.error("Error al buscar películas:", error);
        if (containerObj) {
            containerObj.innerHTML = "<p>No se pudieron cargar los resultados</p>";
        } else if (searchResultsContainer) {
            searchResultsContainer.innerHTML = "<p>No se pudieron cargar los resultados</p>";
        }
    }
}

// Búsqueda específica para single list page
if (listSearchForm) {
    listSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = listSearchInput.value.trim();
        if (query) {
            searchMovies(query, listSearchResults, displayListSearchResults);
        }
    });
}
if (closeSearchBtn) {
    closeSearchBtn.addEventListener("click", () => {
        listSearchSection.classList.add("hidden");
        listSearchInput.value = "";
    });
}
function displaySearchResults(movies) {
    searchResultsContainer.innerHTML = "";
    if (movies.length === 0) {
        searchResultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }
    movies.forEach(movie => {
        if (!movie.poster_path) return;

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
        addToListSelect.addEventListener("change", (event) => {
            const selectedListName = event.target.value;
            if (selectedListName) {
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
    });
}

// Display results specifically for lista.html
function displayListSearchResults(movies) {
    if (!listSearchResults) return;

    listSearchResults.innerHTML = "";
    listSearchSection.classList.remove("hidden");

    if (movies.length === 0) {
        listSearchResults.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentListName = urlParams.get('list');

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieCard = document.createElement("article");
        movieCard.className = "movie-card";

        const movieImage = document.createElement("img");
        movieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieImage.alt = movie.title;

        const movieTitle = document.createElement("h4");
        movieTitle.textContent = movie.title;

        const addButton = document.createElement("button");
        addButton.className = "add-to-list-instant-btn";
        addButton.textContent = "Añadir a la lista";

        addButton.addEventListener("click", () => {
            const movieData = {
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path
            };
            addMovieToList(currentListName, movieData);

            // Provide visual feedback
            addButton.textContent = "¡Añadida!";
            addButton.style.backgroundColor = "rgba(0, 224, 84, 0.4)";
            setTimeout(() => {
                addButton.textContent = "Añadir a la lista";
                addButton.style.backgroundColor = "rgba(0, 224, 84, 0.2)";
            }, 1500);

            // Re-render the current list grid
            initListaPage(currentListName);
        });

        movieCard.appendChild(movieImage);
        movieCard.appendChild(movieTitle);
        movieCard.appendChild(addButton);
        listSearchResults.appendChild(movieCard);
    });
}

function addMovieToList(listName, movieData) {
    const list = watchlists.find(list => list.name === listName);
    if (!list) return;

    const movieExists = list.movies.find(movie => movie.id === movieData.id);
    if (movieExists) {
        alert(`"${movieData.title}" ya está en tu lista "${listName}".`); return;
    }
    list.movies.push(movieData);
    saveWatchlistToLocalStorage();
    renderWatchlists();
}
function renderWatchlists() {
    // Renderear en index.html si el contenedor existe
    if (watchlistsContainer) {
        watchlistsContainer.innerHTML = "";

        const gridContainer = document.createElement("div");
        gridContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";

        renderGridCards(gridContainer);
        watchlistsContainer.appendChild(gridContainer);
    }

    // Renderear en mis_listas.html si el grid existe
    if (misListasGrid) {
        misListasGrid.innerHTML = "";
        renderGridCards(misListasGrid);
    }

    // Renderear actividad reciente si la tabla existe
    if (recentActivityTable) {
        renderRecentActivity();
    }
}

function renderGridCards(containerElement) {
    watchlists.forEach(list => {
        // Generar la tarjeta de la lista principal
        const listCard = document.createElement("div");
        listCard.className = "group relative flex flex-col bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 shadow-2xl h-full cursor-pointer";

        // Área superior con fondos de pósters
        const coversArea = document.createElement("div");
        coversArea.className = "h-48 relative overflow-hidden flex items-end p-4 gap-1 bg-gradient-to-t from-background-dark/80 to-transparent";

        const backgroundsContainer = document.createElement("div");
        backgroundsContainer.className = "absolute inset-0 z-0 flex gap-1 p-2 bg-slate-800/50";

        // Mostrar hasta 3 imágenes de fondo de las películas de la lista
        const maxCovers = Math.min(3, list.movies.length);
        if (list.movies.length > 0) {
            for (let i = 0; i < maxCovers; i++) {
                const cover = document.createElement("div");
                cover.className = "flex-1 h-full rounded bg-cover bg-center transition-transform duration-700 group-hover:scale-105";
                cover.style.backgroundImage = `url('https://image.tmdb.org/t/p/w500${list.movies[i].poster_path}')`;
                backgroundsContainer.appendChild(cover);
            }

            // Si hay más películas que 3, mostrar contador extra
            if (list.movies.length > 3) {
                const extraCount = document.createElement("div");
                extraCount.className = "flex-1 h-full rounded bg-cover bg-center flex items-center justify-center bg-slate-700/80 text-xs font-bold text-slate-300";
                extraCount.textContent = "+" + (list.movies.length - 3);
                backgroundsContainer.appendChild(extraCount);
            }
        } else {
            // Estilo de lista vacía
            const emptyCover = document.createElement("div");
            emptyCover.className = "flex-1 h-full rounded bg-slate-800/80 flex items-center justify-center text-slate-500";
            emptyCover.innerHTML = `<span class="material-symbols-outlined text-4xl">movie</span>`;
            backgroundsContainer.appendChild(emptyCover);
        }

        coversArea.appendChild(backgroundsContainer);

        // Etiqueta de visibilidad/estado simulada
        const tag = document.createElement("div");
        tag.className = "z-10 bg-slate-600 text-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest";
        tag.textContent = "Private";  // Mantenemos Privado por default para el UI mockup
        coversArea.appendChild(tag);

        // Área inferior con información de la lista
        const infoArea = document.createElement("div");
        infoArea.className = "p-5 flex flex-col gap-1 flex-1";

        const infoTopFlex = document.createElement("div");
        infoTopFlex.className = "flex justify-between items-start";

        const listTitle = document.createElement("h3");
        listTitle.className = "text-slate-100 text-xl font-bold group-hover:text-primary transition-colors line-clamp-1";
        listTitle.textContent = list.name;

        const deleteButton = document.createElement("button");
        deleteButton.className = "text-slate-400 hover:text-red-500 transition-colors z-20 relative p-1";
        deleteButton.title = "Eliminar Lista";
        deleteButton.innerHTML = `<span class="material-symbols-outlined text-lg">delete_sweep</span>`;

        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`¿Estás seguro de eliminar la lista "${list.name}"?`)) {
                deleteList(list.name);
            }
        });

        infoTopFlex.appendChild(listTitle);
        infoTopFlex.appendChild(deleteButton);

        const statsRow = document.createElement("div");
        statsRow.className = "flex items-center gap-3 text-slate-400 text-sm mt-auto pt-4";

        const itemCount = document.createElement("span");
        itemCount.className = "flex items-center gap-1";
        itemCount.innerHTML = `<span class="material-symbols-outlined text-xs">movie</span> ${list.movies.length} items`;

        statsRow.appendChild(itemCount);

        infoArea.appendChild(infoTopFlex);
        infoArea.appendChild(statsRow);

        listCard.appendChild(coversArea);
        listCard.appendChild(infoArea);

        // Configurar el click para ver la lista (funcionalidad redirigir)
        listCard.addEventListener('click', () => {
            window.location.href = `lista.html?list=${encodeURIComponent(list.name)}`;
        });

        containerElement.appendChild(listCard);
    });

    // Añadir el "placeholder de botón" si estamos en mis_listas.html
    if (containerElement === misListasGrid || containerElement.classList.contains("grid")) {
        const createNewCard = document.createElement("div");
        // Aseguramos que se visualice correctamente usando las clases del placeholder
        createNewCard.className = "group relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 rounded-xl cursor-pointer transition-all min-h-[250px] shadow-sm";
        createNewCard.innerHTML = `
            <div class="flex flex-col items-center gap-4 text-slate-400 group-hover:text-primary pointer-events-none">
                <span class="material-symbols-outlined text-5xl transition-transform group-hover:scale-110">add_circle</span>
                <span class="font-bold text-lg">Nueva Lista</span>
            </div>
        `;

        createNewCard.addEventListener('click', () => {
            const inputList = document.getElementById("new-list-input");
            if (inputList) {
                inputList.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        containerElement.appendChild(createNewCard);
    }
}

function renderRecentActivity() {
    recentActivityTable.innerHTML = "";

    if (watchlists.length === 0) {
        recentActivityTable.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center text-slate-500 font-medium">No has creado listas aún.</td>
            </tr>
        `;
        return;
    }

    // Mostramos las últimas 5 listas como "actividad reciente" a manera de mockup funcional
    const recentLists = [...watchlists].reverse().slice(0, 5);

    recentLists.forEach(list => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 transition-colors group";

        tr.innerHTML = `
            <td class="px-6 py-4 font-semibold text-slate-100">${list.name}</td>
            <td class="px-6 py-4 text-slate-400 text-center">${list.movies.length} Películas</td>
            <td class="px-6 py-4 text-center">
                <span class="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Private</span>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="delete-activity-btn text-slate-500 hover:text-accent-warn transition-colors text-sm font-bold flex items-center justify-end gap-1 ml-auto">
                    <span class="material-symbols-outlined text-base">delete</span>
                    <span>Delete</span>
                </button>
            </td>
        `;

        const deleteBtn = tr.querySelector('.delete-activity-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm(`¿Estás seguro de eliminar la lista "${list.name}"?`)) {
                deleteList(list.name);
            }
        });

        recentActivityTable.appendChild(tr);
    });
}







// Lógica de inicio específica para lista.html
function initListaPage(listName) {
    if (!listTitleEl || !listMetaEl || !listMoviesGrid) return;

    listTitleEl.textContent = listName;

    const list = watchlists.find(l => l.name === listName);
    if (!list) {
        listMetaEl.textContent = "Lista no encontrada";
        listMoviesGrid.innerHTML = "<p>No existe esta lista o fue eliminada.</p>";
        return;
    }

    listMetaEl.innerHTML = `<span class="material-symbols-outlined text-sm align-middle mr-1">movie</span>${list.movies.length} películas guardadas`;

    listMoviesGrid.innerHTML = "";
    if (list.movies.length === 0) {
        listMoviesGrid.innerHTML = "<p>Esta lista está vacía actualmente. Utiliza el buscador arriba para añadir películas.</p>";
        return;
    }

    list.movies.forEach(movie => {
        const movieCard = document.createElement("article");
        movieCard.className = "movie-card";

        const movieImage = document.createElement("img");
        movieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieImage.alt = movie.title;

        const movieTitle = document.createElement("h4");
        movieTitle.textContent = movie.title;
        movieTitle.style.bottom = "1rem"; // Override style since there's no select btn

        const removeButton = document.createElement("button");
        removeButton.className = "add-to-list-instant-btn";
        removeButton.style.color = "#ef4444"; // red
        removeButton.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
        removeButton.style.borderColor = "rgba(239, 68, 68, 0.3)";
        removeButton.textContent = "Quitar Película";

        // Also ensure title is moved up on hover by injecting CSS
        movieTitle.style.transition = "bottom 0.3s";
        movieCard.addEventListener("mouseenter", () => movieTitle.style.bottom = "3.5rem");
        movieCard.addEventListener("mouseleave", () => movieTitle.style.bottom = "1rem");

        removeButton.addEventListener("click", () => {
            if (confirm(`¿Quitar "${movie.title}" de la lista?`)) {
                list.movies = list.movies.filter(m => m.id !== movie.id);
                saveWatchlistToLocalStorage();
                initListaPage(listName); // Refresh view
            }
        });

        movieCard.appendChild(movieImage);
        movieCard.appendChild(movieTitle);
        movieCard.appendChild(removeButton);
        listMoviesGrid.appendChild(movieCard);
    });
}

loadWatchlistFromLocalStorage();

// Nav Scroll Spy Logic
document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        document.getElementById('search-section'),
        document.getElementById('movies-section'),
        document.getElementById('lists-section')
    ];

    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('text-primary');
                    link.classList.add('text-slate-400', 'hover:text-white');

                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('text-primary');
                        link.classList.remove('text-slate-400', 'hover:text-white');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section) observer.observe(section);
    });
});
