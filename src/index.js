import SimpleLightbox from "simplelightbox";
import Notiflix from 'notiflix';
import{PixibuyApi} from './js/pixabay-api';

const formEl = document.querySelector('.js-search-form');
const inputEl = document.querySelector('.js-search-input');
const galleryEl = document.querySelector('.gallery');
const closeBtnEl = document.querySelector('.js-btn-close');
const loadMoreBtnEl = document.querySelector('.js-load-more-btn');

loadMoreBtnEl.style.display = 'none';

const pixibuyApi = new PixibuyApi();

let lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
});

closeBtnEl.style.display = 'none';

const onSearchFormSubmit = async event => {
    event.preventDefault();

    galleryEl.innerHTML = '';
  
    pixibuyApi.query = event.currentTarget.elements.searchQuery.value;
    
    pixibuyApi.resetPage();
    try {
      const { data } = await pixibuyApi.fetchPhotos();
     
      if (data.totalHits === 0) {
       
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        loadMoreBtnEl.style.display = 'none';
      }
        else if (data.totalHits <= 40) {
          markupGalleryItems(data.hits);
    
          loadMoreBtnEl.style.display = 'none';
      } else {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      
        markupGalleryItems(data.hits);
        lightbox.refresh();
        loadMoreBtnEl.style.display = 'none';
        loadMoreBtnEl.style.display = 'block';
      }
    } catch (error) {
      console.log('error :', error);
    }
    pixibuyApi.incrementPage();
  };
  
  formEl.addEventListener('submit', onSearchFormSubmit);
  
  // load more function
  
  const onClickLoadMore = async () => {
    try {
      const { data } = await pixibuyApi.fetchPhotos();
      let totalPages = Math.ceil(data.totalHits / data.hits.length);
      // console.log(`Total pages: ${totalPages}`);
      if (totalPages === pixibuyApi.page + 1) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        loadMoreBtnEl.style.display = 'none';
        markupGalleryItems(data.hits);
        lightbox.refresh();
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      } else {
        markupGalleryItems(data.hits);
        lightbox.refresh();
        pixibuyApi.incrementPage();
        const { height: cardHeight } = document.querySelector('.container--gallery').firstElementChild.getBoundingClientRect();
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      }
    } catch (error) {
      console.log('error :', error);
    }
  };
  
  loadMoreBtnEl.addEventListener('click', onClickLoadMore);
  
  // markup function
  const markupGalleryItems = hits => {
    let markupItems = hits
      .map(hit => {
        return `<li class="photo-card">
          <a class="gallery__item" href="${hit.largeImageURL}">
          <img class="photo-card__img" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" width=300 height=190/>
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${hit.likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${hit.views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${hit.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${hit.downloads}
            </p>
          </div>
        </li>`;
      })
      .join('');
    return galleryEl.insertAdjacentHTML('beforeend', markupItems);
  };
