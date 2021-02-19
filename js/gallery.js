class Gallery {
    constructor() {
        this.elem = {
            loader: document.querySelector('.js-loader'),
            favSection: document.querySelector('.js-fav'),
            favTrigger: document.querySelector('.js-fav-trigger'),
            favContent: document.querySelector('.js-fav-content'),
            favList: document.querySelector('.js-fav-list'),
            genreSelect: document.querySelector('.js-genre-select'),
            viewSelect: document.querySelectorAll('.js-gal-type'),
            galleryList: document.querySelector('.js-gallery-list'),
            modal: document.querySelector('.js-modal'),
            closeModalBtn: document.querySelector('.js-close-modal'),
            modalContent: document.querySelector('.js-modal-content'),
        };
        this.class = {
            loader: {
                fadeOut: 'loader--fade-out',
                hidden: 'loader--hidden',
            },
            fav: {
                active: 'fav--active',
                noAnim: 'fav--no-anim',
            },
            viewSelect: {
                card: 'js-gal-type-card',
                active: 'gallery__view-type--active'
            },
            galleryList: {
                cards: 'gallery__list--cards',
            },
            galleryFilm: {
                fav: 'gallery__film--fav',
            },
            modal: {
                fadeIn: 'modal--fade-in',
                hidden: 'modal--hidden',
            },
            modalStar: {
                fav: 'modal__star--fav',
            }
        };
        this.fullList = [];
        this.favFilmsIdList = JSON.parse(localStorage.getItem('hv-movies-fav-list')) || [];
        this.fetchErrorCount = 0;
        this.breakPoint = 992;
        this.windowWidth = window.innerWidth;
        this.animDur = {
            loader: 500,
            favList: 250,
            modal: 300,
        };
    }

    /* film card - template */
    galleryFilmBlockTemplate(filmData) {
        // if film is in users favorite list - mark it as favorite
        return `<div class="gallery__film${this.favFilmsIdList.includes(filmData.id) ? ` ${this.class.galleryFilm.fav}` : ''}">
                    <button class="gallery__star js-fav-state-toggler" data-id="${filmData.id}">
                        <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <polygon points="256 21.33 320 192 490.67 192 362.67 320 405.33 490.66 256 383.99 106.67 490.66 149.33 320 21.33 192 192 192 256 21.33"/>
                        </svg>
                    </button>
                    <div class="gallery__poster">
                        <div class="poster">
                            <div class="poster__inner">
                                <img class="poster__img" src="${filmData.img}" alt="${filmData.name}" loading="lazy" />
                            </div>
                        </div>
                    </div>
                    <div class="gallery__film-info">
                        <div class="gallery__film-headline">
                            <h3 class="gallery__film-name">
                                ${filmData.name}
                            </h3>
                            <p class="gallery__film-year">
                                (${filmData.year})
                            </p>
                        </div>
                        <p class="gallery__film-descr">
                            ${filmData.description}
                        </p>
                        <p class="gallery__film-genres">
                            ${filmData.genres.join(', ')}
                        </p>
                    </div>
                </div>`;
    }

    /* film as favorite list item - template */
    favoriteListItemTemplate(filmData) {
        return `<div class="fav__film">
                    <button class="fav__open js-open-details" data-id="${filmData.id}" 
                        aria-label="Open film details"></button>
                    ${filmData.name}
                    <button class="fav__remove js-remove-from-fav" data-id="${filmData.id}" 
                        aria-label="Remove film from favorites"></button>
                </div>`;
    }

    /* modal content film information - template */
    modalContentTemplate(filmData) {
        return `<div class="modal__main-info">
                    <div class="modal__main-left">
                        <div class="poster">
                            <div class="poster__inner">
                                <img class="poster__img" src="${filmData.img}" alt="${filmData.name}" />
                            </div>
                        </div>
                        <p class="modal__film-year">
                            <button class="modal__star${this.favFilmsIdList.includes(filmData.id) ? ` ${this.class.modalStar.fav}` : ''} js-fav-state-toggler">
                                <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <polygon points="256 21.33 320 192 490.67 192 362.67 320 405.33 490.66 256 383.99 106.67 490.66 149.33 320 21.33 192 192 192 256 21.33"/>
                                </svg>
                            </button>
                            (${filmData.year})
                        </p>
                    </div>
                    <div class="modal__main-right">
                        <h3 class="modal__film-name">
                            ${filmData.name}
                        </h3>
                        <p class="modal__film-descr">
                            ${filmData.description}
                        </p>
                    </div>
                </div>
                <div class="modal__add-info">
                    <p class="modal__film-genres">
                        ${filmData.genres.join(', ')}
                    </p>
                    <div class="modal__extra-info">
                        <p>
                            <span>Director:</span>
                            <span>${filmData.director}</span>
                        </p>
                        <p>
                            <span>Starring:</span> 
                            <span>${filmData.starring.join(', ')}</span>    
                        </p>
                    </div>
                </div>`;
    }

    /* automatically show/hide mob. version favorite list */
    toggleFavoriteList() {
        this.elem.favSection.classList.contains(this.class.fav.active)
            ? this.hideFavoriteList()
            : this.showFavoriteList();
    }

    /* show mob. version favorite list */
    showFavoriteList() {
        this.blockBtnTemporarily(this.elem.favTrigger, this.animDur.favList);
        this.elem.favSection.classList.add(this.class.fav.active);
    }

    /* hide mob. version favorite list */
    hideFavoriteList() {
        this.blockBtnTemporarily(this.elem.favTrigger, this.animDur.favList);
        this.elem.favSection.classList.remove(this.class.fav.active);
    }

    /* set button as disabled for a while */
    blockBtnTemporarily(btn, ms) {
        btn.setAttribute('disabled', true);
        setTimeout(() => {
            btn.removeAttribute('disabled');
        }, ms || 0);
    }

    /* toggle type of view films list: simple or detailed cards */
    selectMoviesViewType(trigger) {
        if (trigger.classList.contains(this.class.viewSelect.active)) return;

        [].forEach.call(this.elem.viewSelect, btn => {
            btn.classList.toggle(this.class.viewSelect.active);
        });

        trigger.classList.contains(this.class.viewSelect.card)
            ? this.elem.galleryList.classList.add(this.class.galleryList.cards)
            : this.elem.galleryList.classList.remove(this.class.galleryList.cards);
    }

    /* show films only with selected genre */
    filterFilmsViewByGenre(genre) {
        this.fullList.forEach(filmData => {
            this.elem.galleryList.querySelector(`[data-id="${filmData.id}"]`).style.display =
                (filmData.genres.includes(genre) || genre === '-') ? 'block' : 'none';
        });
    }

    /* handle addition or removing film from favorite list */
    toggleFilmFavoriteState(filmId) {
        this.favFilmsIdList.indexOf(filmId) === -1
            ? this.addFilmToFavoriteListHelper(filmId)
            : this.removeFilmFromFavoriteListHelper(filmId);
    }

    /* add film to favorite list */
    addFilmToFavoriteListHelper(filmId) {
        this.favFilmsIdList.push(filmId);
        this.addFilmToFavorites(filmId);
        localStorage.setItem('hv-movies-fav-list', JSON.stringify(this.favFilmsIdList));
    }

    /* do some changes in DOM while adding film to favorites */
    addFilmToFavorites(filmId) {
        this.elem.galleryList.querySelector(`[data-id="${filmId}"] .gallery__film`)
            .classList.add(this.class.galleryFilm.fav);

        const listItem = document.createElement('li');
        listItem.setAttribute('data-id', `${filmId}`);
        listItem.innerHTML = this.favoriteListItemTemplate(this.fullList.find(film => film.id === filmId));
        this.elem.favList.append(listItem);

        listItem.querySelector('.js-remove-from-fav').addEventListener('click', () => {
            this.removeFilmFromFavoriteListHelper(filmId);
        });
        listItem.querySelector('.js-open-details').addEventListener('click', () => {
            this.openFilmDetails(filmId);
        });
    }

    /* remove film from favorite list */
    removeFilmFromFavoriteListHelper(filmId) {
        this.favFilmsIdList.splice(this.favFilmsIdList.indexOf(filmId), 1);
        this.removeFilmFromFavorites(filmId);
        localStorage.setItem('hv-movies-fav-list', JSON.stringify(this.favFilmsIdList));
    }

    /* do some changes in DOM while removing film from favorites */
    removeFilmFromFavorites(filmId) {
        this.elem.galleryList.querySelector(`[data-id="${filmId}"] .gallery__film`)
            .classList.remove(this.class.galleryFilm.fav);

        this.elem.favList.querySelector(`li[data-id="${filmId}"]`).remove();
    }

    /* show film details in separated modal */
    openFilmDetails(filmId) {
        this.hideFavoriteList();

        this.elem.modalContent.innerHTML =
            this.modalContentTemplate(this.fullList.find(film => film.id === filmId));

        this.elem.modalContent.querySelector('.js-fav-state-toggler')
            .addEventListener('click', (e) => {
                const btn = e.target.closest('.js-fav-state-toggler');

                this.toggleFilmFavoriteState(filmId);

                this.favFilmsIdList.indexOf(filmId) === -1
                    ? btn.classList.remove(this.class.modalStar.fav)
                    : btn.classList.add(this.class.modalStar.fav);
            });

        this.elem.modal.classList.remove(this.class.modal.hidden);
        this.elem.modal.classList.add(this.class.modal.fadeIn);
    }

    /* hide film details modal */
    hideFilmDetails() {
        this.elem.modal.classList.remove(this.class.modal.fadeIn);
        setTimeout(() => {
            this.elem.modal.classList.add(this.class.modal.hidden);
        }, this.animDur.modal);
    }

    /* fetch movies data and parse it */
    getMoviesData() {
        fetch('https://my-json-server.typicode.com/moviedb-tech/movies/list')
            .then(response => response.json())
            .then(data => {
                const uniqueGenresList = [];
                console.debug(data);

                // render received films into gallery list
                this.fullList = data.map(film => {
                    const prettifiedFilmData = {
                        ...film,
                        genres: film.genres.map(item => item.capitalize()),
                    };

                    uniqueGenresList.push(...prettifiedFilmData.genres);

                    const listItem = document.createElement('li');
                    listItem.setAttribute('data-id', `${prettifiedFilmData.id}`);
                    listItem.innerHTML = this.galleryFilmBlockTemplate(prettifiedFilmData);
                    this.elem.galleryList.append(listItem);

                    // add fav state toggle action
                    listItem.querySelector('.js-fav-state-toggler')
                        .addEventListener('click', (e) => {
                            const targetId = +e.target.closest('.js-fav-state-toggler').getAttribute('data-id');
                            this.toggleFilmFavoriteState(targetId);
                        });

                    return prettifiedFilmData;
                });

                this.favFilmsIdList.forEach(id => {
                    this.addFilmToFavorites(id);
                });

                // render sort select options
                [...new Set(uniqueGenresList)].sort().forEach(genre => {
                    const option = document.createElement('option');
                    option.setAttribute('value', genre);
                    option.innerText = genre;
                    this.elem.genreSelect.append(option);
                });

                this.removePageLoader();
            })
            .catch(() => {
                if (++this.fetchErrorCount < 5) {
                    this.getMoviesData();
                } else {
                    // show warning or something like that
                }
            })
    }

    resizeHandler() {
        /* mobile -> desktop layout or desktop -> mobile */
        if ((window.innerWidth >= this.breakPoint && this.windowWidth < this.breakPoint)
            || (window.innerWidth < this.breakPoint && this.windowWidth >= this.breakPoint)) {
            /* unable transition for a while */
            this.elem.favSection.classList.add(this.class.fav.noAnim);
            setTimeout(() => {
                this.elem.favSection.classList.remove(this.class.fav.noAnim);
            });
            /* should be hidden, when user gets back to mobile version */
            this.hideFavoriteList();
        }
        /* fix aside fav content block height */
        this.elem.favContent.style.height = (window.innerWidth < this.breakPoint)
            ? `${window.innerHeight}px` : 'auto';

        this.windowWidth = window.innerWidth;
    }

    /* set events */
    bindEvents() {
        this.elem.favTrigger.addEventListener(
            'click',
            this.toggleFavoriteList.bind(this)
        );

        [].forEach.call(this.elem.viewSelect, btn => {
            btn.addEventListener('click', () => {
                this.selectMoviesViewType(btn);
            });
        });

        this.elem.genreSelect.addEventListener('change', (e) => {
            this.filterFilmsViewByGenre(e.target.value);
        });

        this.elem.closeModalBtn.addEventListener(
            'click',
            this.hideFilmDetails.bind(this)
        );

        window.addEventListener(
            'resize',
            this.resizeHandler.bind(this)
        );
    }

    /* remove loader when data is loaded and implemented */
    removePageLoader() {
        this.elem.loader.classList.add(this.class.loader.fadeOut);
        setTimeout(() => {
            this.elem.loader.classList.add(this.class.loader.hidden);
        }, this.animDur.loader);
    }

    /* trigger gallery logic */
    init() {
        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };

        this.getMoviesData();
        this.bindEvents();
    }
}

window.addEventListener('load', () => {
    const gallery = new Gallery();
    gallery.init();
});