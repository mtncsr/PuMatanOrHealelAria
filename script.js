let currentScreen = 1;
const totalNarrativeScreens = 7;
let modalContent = {}; 

// הפיכת blessingData לנגיש ב-window עבור openModal
window.blessingData = blessingData;

// --- בניית HTML דינמית (מסכים 2-7) ---
function buildNarrativeScreens() {
    const container = document.getElementById('app-container');
    const finalContent = document.getElementById('final-content');
    const navList = document.getElementById('nav-list');
    
    for (let i = 2; i <= totalNarrativeScreens; i++) {
        const data = screensData[i-1];
        
        // יצירת תוכן המסך (למצב נרטיב)
        const screenHTML = createScreenHTML(data, i);
        container.insertAdjacentHTML('beforeend', screenHTML);
        
        // יצירת כפתור ניווט מהיר
         const navItem = document.createElement('li');
         const navLink = document.createElement('a');
         navLink.className = 'royal-title';
         navLink.textContent = data.title;
         navLink.onclick = () => navigateToScreen(i);
         navItem.appendChild(navLink);
         navList.appendChild(navItem);
    }
}

function createScreenHTML(data, screenNum) {
    const isBlessing = data.isBlessing;
    const carouselId = `carousel-${screenNum}`;
    
    let items = isBlessing ? blessingData : Array.from({ length: data.count }, (_, j) => ({ 
        img: `${data.prefix}${j + 1}`, // בלי סיומת – ננסה jpg ואז png
        alt: `${data.prefix} ${j + 1}` 
    }));

    // יצירת האובייקטים המרכזיים
    let mainItemsHTML = '';
    items.forEach((item, index) => {
        if (isBlessing) {
            mainItemsHTML += `
                <div class="carousel-main-item" data-index="${index}" ${index === 0 ? 'style="display: block;"' : ''}>
                    <div class="carousel-main-blessing">
                        <span class="blessing-date">${item.date}</span>
                        <div class="blessing-text">${item.text}</div>
                    </div>
                </div>
            `;
        } else {
            const imgBase = item.img || `${data.prefix}${index + 1}`;
            mainItemsHTML += `
                <div class="carousel-main-item ${index === 0 ? 'active' : ''}" data-index="${index}" ${index === 0 ? 'style="display: block;"' : ''}>
                    <div class="carousel-main-content">
                        <img src="images/${imgBase}.jpg" 
                             data-alt-src="images/${imgBase}.png"
                             alt="${item.alt}" 
                             data-index="${index}"
                             onerror="this.onerror=null; this.src=this.getAttribute('data-alt-src');">
                    </div>
                </div>
            `;
        }
    });

    return `
        <div id="${data.id}" class="app-screen" style="display: none;">
            <p class="screen-text">${data.text}</p>
            <h2 class="royal-title">${data.title}</h2>
            <div class="carousel-wrapper" id="${carouselId}-wrapper">
                <button class="carousel-arrow prev" onclick="carouselPrev('${carouselId}')">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button class="carousel-arrow next" onclick="carouselNext('${carouselId}')">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div id="${carouselId}-main">
                    ${mainItemsHTML}
                </div>
                <div id="thumbnails-${screenNum}" class="thumbnails"></div>
            </div>
            <div class="screen-buttons">
                <button onclick="${screenNum === totalNarrativeScreens ? 'showFinalContent()' : 'nextScreen()'}">${data.nextBtn}</button>
            </div>
        </div>
    `;
}

function createScrollContentHTML(data) {
    const isBlessing = data.isBlessing;
    let contentHTML = '';
    
    if (isBlessing) {
        let blessingsScrollHTML = '';
        blessingData.forEach(item => {
            blessingsScrollHTML += `
                <div class="blessing-card-scrolled">
                    <span class="blessing-date">${item.date}</span>
                    <div class="blessing-text" style="max-height: none; overflow: visible;">${item.text}</div>
                </div>
            `;
        });
        contentHTML = `<div class="blessing-carousel-scrolled">${blessingsScrollHTML}</div>`;
        
    } else {
         let imagesScrollHTML = '';
         for (let j = 1; j <= data.count; j++) {
            const imgPath = `images/${data.prefix}${j}.jpg`;
            imagesScrollHTML += `<img src="${imgPath}" alt="${data.prefix} ${j}">`;
         }
        contentHTML = `<div class="image-gallery-scrolled" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">${imagesScrollHTML}</div>`;
    }

    return `
        <section id="${data.anchor}" class="scrolled-content" style="background-color: ${isBlessing ? 'var(--secondary-color)' : 'white'};">
            <p class="screen-text">${data.text}</p>
            <h2 class="royal-title">${data.title}</h2>
            ${contentHTML}
        </section>
    `;
}

// --- ניהול מסכים ---
function updateScreen(animate = true) {
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    const current = document.getElementById(`screen-${currentScreen}`);
    if (current) {
        current.style.display = 'flex';
        document.body.style.overflowY = 'hidden'; 
    }
    
    // עדכון ה-Top Bar
    const topBar = document.getElementById('top-bar');
    if (currentScreen > 1 && currentScreen <= totalNarrativeScreens) {
        topBar.style.display = 'flex';
        document.getElementById('screen-title').textContent = screensData[currentScreen - 1].title;
        topBar.querySelector('button:first-child').style.visibility = (currentScreen > 2) ? 'visible' : 'hidden'; // הסתר כפתור הקודם במסך 2
    } else {
         topBar.style.display = 'none';
    }
    
    if (currentScreen >= 2 && currentScreen <= totalNarrativeScreens) {
        initializeCarousel(`carousel-${currentScreen}`, animate);
    }
}

function nextScreen() {
    if (currentScreen < totalNarrativeScreens) {
        currentScreen++;
        updateScreen();
    } else if (currentScreen === totalNarrativeScreens) {
        showFinalContent();
    }
}

function prevScreen() {
    if (currentScreen > 1) {
        currentScreen--;
        updateScreen();
    } 
}

function showFinalContent() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('top-bar').style.display = 'none';
    document.getElementById('final-content').style.display = 'none';
    document.getElementById('nav-menu').style.display = 'flex';
    document.body.style.overflowY = 'hidden'; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleNavMenu(forceOpen = false) {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu.style.display === 'flex' && !forceOpen) {
        navMenu.style.display = 'none';
        document.body.style.overflowY = 'scroll'; 
    } else {
        navMenu.style.display = 'flex';
        document.body.style.overflowY = 'hidden'; 
    }
}

window.navigateToScreen = function(screenNum) {
    // הסתרת תפריט הניווט
    document.getElementById('nav-menu').style.display = 'none';
    // הצגת המסכים
    document.getElementById('app-container').style.display = 'block';
    // עדכון המסך הנוכחי
    currentScreen = screenNum;
    // עדכון התצוגה
    updateScreen();
}

// --- לוגיקת קרוסלה פשוטה ---
const carousels = {};

function initializeCarousel(carouselId) {
    const mainContainer = document.getElementById(`${carouselId}-main`);
    const screenNum = parseInt(carouselId.split('-')[1]);
    
    if (!mainContainer) return;

    const screenData = screensData[screenNum - 1];
    const isBlessing = screenData.isBlessing;
    const items = isBlessing ? blessingData : Array.from({ length: screenData.count }, (_, j) => ({ 
        img: `${screenData.prefix}${j + 1}`, // בלי סיומת – נטפל בה בטעינה
        alt: `${screenData.prefix} ${j + 1}` 
    }));

    if (carousels[carouselId]) {
        carousels[carouselId].currentIndex = 0;
    } else {
        carousels[carouselId] = {
            id: carouselId,
            mainContainer: mainContainer,
            items: items,
            currentIndex: 0,
            total: items.length,
            isBlessing: isBlessing
        };
    }
    
    const carousel = carousels[carouselId];
    
    // יצירת thumbnails
    createThumbnails(carouselId, carousel);
    
    // הגדרת event listeners על האובייקט המרכזי
    setupMainItemEvents(carouselId, carousel);
    
    // עדכון תצוגה ראשונית
    updateCarouselDisplay(carouselId);
}

// יצירת שורת thumbnails
function createThumbnails(carouselId, carousel) {
    const screenNum = parseInt(carouselId.split('-')[1]);
    const thumbnailsContainer = document.getElementById(`thumbnails-${screenNum}`);
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = '';
    
    carousel.items.forEach((item, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
        thumb.setAttribute('data-thumb-index', index);
        
        if (carousel.isBlessing) {
            thumb.className += ' blessing-thumb';
            const dateText = item.date.split(' - ')[0]; // רק התאריך
            thumb.textContent = dateText;
        } else {
            const screenData = screensData[screenNum - 1];
            const imgBase = `${screenData.prefix}${index + 1}`;
            const img = document.createElement('img');
            img.src = `images/${imgBase}.jpg`;
            img.setAttribute('data-alt-src', `images/${imgBase}.png`);
            img.alt = `${screenData.prefix} ${index + 1}`;
            img.onerror = function() {
                this.onerror = null;
                this.src = this.getAttribute('data-alt-src');
            };
            thumb.appendChild(img);
        }
        
        thumb.addEventListener('click', () => {
            setCurrentSlide(carouselId, index);
        });
        
        thumbnailsContainer.appendChild(thumb);
    });
}

// הגדרת event listeners על האובייקט המרכזי
function setupMainItemEvents(carouselId, carousel) {
    const mainItems = carousel.mainContainer.querySelectorAll('.carousel-main-item');
    mainItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            window.openModal(carouselId, index);
        });
    });
}

// עדכון תצוגת הקרוסלה
function updateCarouselDisplay(carouselId) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    
    // הסתרת כל הפריטים והצגת הפריט הנוכחי בלבד
    const mainItems = carousel.mainContainer.querySelectorAll('.carousel-main-item');
    mainItems.forEach((item, index) => {
        if (index === carousel.currentIndex) {
            item.style.display = 'block';
            item.classList.add('active');
        } else {
            item.style.display = 'none';
            item.classList.remove('active');
        }
    });
    
    // עדכון thumbnails
    const screenNum = parseInt(carouselId.split('-')[1]);
    const thumbnails = document.querySelectorAll(`#thumbnails-${screenNum} .thumbnail-item`);
    thumbnails.forEach((thumb, index) => {
        if (index === carousel.currentIndex) {
            thumb.classList.add('active');
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('active');
        }
    });
}

// פונקציות ניווט
window.carouselPrev = function(carouselId) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    
    let newIndex = carousel.currentIndex - 1;
    if (newIndex < 0) {
        newIndex = carousel.total - 1;
    }
    setCurrentSlide(carouselId, newIndex);
};

window.carouselNext = function(carouselId) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    
    let newIndex = carousel.currentIndex + 1;
    if (newIndex >= carousel.total) {
        newIndex = 0;
    }
    setCurrentSlide(carouselId, newIndex);
};

window.setCurrentSlide = function(carouselId, index) {
    const carousel = carousels[carouselId];
    if (!carousel) return;

    // בדיקת גבולות (מעבר מעגלי)
    if (index < 0) {
        index = carousel.total - 1;
    } else if (index >= carousel.total) {
        index = 0;
    }

    carousel.currentIndex = index;
    updateCarouselDisplay(carouselId);
}

// --- ניהול Modal (Lightbox) ---

window.openModal = function(carouselId, index) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    
    modalContent = { carouselId: carouselId, index: index, total: carousel.total };
    
    const contentWrapper = document.getElementById('modal-content-wrapper');
    contentWrapper.innerHTML = ''; 
    
    if (carousel.isBlessing) {
        // תוכן הברכה במודל (מציג את הטקסט המלא)
        const blessingDataCurrent = window.blessingData[index];
        const blessingModalHTML = `
            <div class="modal-blessing">
                <span class="blessing-date" style="font-size: 1.5rem;">${blessingDataCurrent.date}</span>
                <div class="blessing-text" style="font-size: 1.1rem; line-height: 1.8; white-space: pre-wrap;">${blessingDataCurrent.text}</div>
            </div>
        `;
        contentWrapper.insertAdjacentHTML('beforeend', blessingModalHTML);
        contentWrapper.style.backgroundColor = 'white';
        
    } else {
        // תוכן תמונה במודל – תצוגה מלאה עם תמיכה ב-JPG/PNG
        const screenNum = parseInt(carouselId.split('-')[1]);
        const screenData = screensData[screenNum - 1];
        const imgBase = `${screenData.prefix}${index + 1}`;
        
        const img = document.createElement('img');
        img.src = `images/${imgBase}.jpg`;
        img.setAttribute('data-alt-src', `images/${imgBase}.png`);
        img.className = 'modal-image';
        img.alt = `${screenData.prefix} ${index + 1}`;
        img.onerror = function() {
            this.onerror = null;
            const altSrc = this.getAttribute('data-alt-src');
            if (altSrc) {
                this.src = altSrc;
            }
        };
        
        contentWrapper.appendChild(img);
        contentWrapper.style.backgroundColor = 'black';
    }
    
    document.getElementById('myModal').style.display = 'flex';
}

window.closeModal = function() {
    document.getElementById('myModal').style.display = 'none';
}

window.modalPrev = function() {
    let newIndex = (modalContent.index - 1 + modalContent.total) % modalContent.total;
    setCurrentSlide(modalContent.carouselId, newIndex);
    openModal(modalContent.carouselId, newIndex);
}

window.modalNext = function() {
    let newIndex = (modalContent.index + 1) % modalContent.total;
    setCurrentSlide(modalContent.carouselId, newIndex);
    openModal(modalContent.carouselId, newIndex);
}

// --- אתחול סופי ---
window.onload = () => {
     buildNarrativeScreens();
     updateScreen(false);
     window.addEventListener('resize', () => {
         if(currentScreen >= 2 && currentScreen <= totalNarrativeScreens) {
             updateCarouselDisplay(`carousel-${currentScreen}`);
         }
     });
};

