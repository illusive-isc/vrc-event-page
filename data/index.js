/* ===== Stars ===== */
(function () {
	const container = document.getElementById('stars');
	const count = window.innerWidth < 600 ? 60 : 120;

	for (let i = 0; i < count; i++) {
		const star = document.createElement('div');
		star.className = 'star';
		star.style.cssText = `
        left:${ Math.random() * 100 }%;
        top:${ Math.random() * 100 }%;
        --d:${ 2 + Math.random() * 4 }s;
        --delay:-${ Math.random() * 5 }s;
        opacity:${ .2 + Math.random() * .8 };
        width:${ Math.random() < .15 ? 3 : Math.random() < .5 ? 2 : 1 }px;
        height:${ Math.random() < .15 ? 3 : Math.random() < .5 ? 2 : 1 }px;
      `;
		container.appendChild(star);
	}
})();

/* ===== Image fallbacks ===== */
document.querySelectorAll('.js-hide-on-error').forEach(img => {
	img.addEventListener('error', () => {
		img.style.display = 'none';
	});
});

const castHeroImage = document.querySelector('.js-hide-cast-hero-on-error');
if (castHeroImage) {
	castHeroImage.addEventListener('error', () => {
		const castHero = castHeroImage.closest('#cast-hero');
		if (castHero) {
			castHero.style.display = 'none';
		}
	});
}

/* ===== Scroll reveal ===== */
const observer = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('visible');
			observer.unobserve(entry.target);
		}
	});
}, { threshold: 0.12 });

/* ===== Cast: JSON load & render ===== */
let castData = [];
let currentCastIndex = 0;
let lastFocusedElement = null;

async function loadCast() {
	try {
		const res = await fetch('data/cast.json');
		castData = await res.json();
		castData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	} catch (error) {
		castData = [];
	}

	renderCast();
}

function renderCast() {
	const grid = document.getElementById('cast-grid');
	grid.innerHTML = '';

	castData.forEach((cast, i) => {
		const card = document.createElement('div');
		card.className = 'cast-card reveal visible';

		const imageWrap = document.createElement('div');
		imageWrap.className = 'cast-image';

		const image = document.createElement('img');
		image.src = cast.image;
		image.alt = cast.name;
		image.loading = 'lazy';
		image.decoding = 'async';
		image.addEventListener('error', () => {
			const placeholder = document.createElement('div');
			placeholder.className = 'cast-image-placeholder';
			placeholder.textContent = 'NO IMAGE';
			imageWrap.replaceChildren(placeholder);
		});
		imageWrap.appendChild(image);

		const info = document.createElement('div');
		info.className = 'cast-info';

		const name = document.createElement('div');
		name.className = 'cast-name';
		name.textContent = cast.name;
		info.appendChild(name);

		card.appendChild(imageWrap);
		card.appendChild(info);
		card.addEventListener('click', () => openLightbox(i));
		grid.appendChild(card);
	});
}

loadCast();

/* ===== Lightbox ===== */
const lightbox = document.getElementById('lightbox');
const lbStage = document.getElementById('lb-stage');
const lbImgCur = document.getElementById('lb-img-cur');
const lbImgNext = document.getElementById('lb-img-next');
const lbClose = document.getElementById('lightbox-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

function stageW() {
	return lbStage.offsetWidth || window.innerWidth;
}

function openLightbox(index) {
	currentCastIndex = index;
	lastFocusedElement = document.activeElement;
	const cast = castData[index];

	lbImgCur.src = cast.image;
	lbImgCur.alt = cast.name;
	lbImgCur.style.transition = 'none';
	lbImgCur.style.transform = 'translateX(0)';

	lbImgNext.src = '';
	lbImgNext.style.transition = 'none';
	lbImgNext.style.transform = 'translateX(100%)';

	lightbox.classList.add('open');
	document.body.style.overflow = 'hidden';
	lbClose.focus();
}

function closeLightbox() {
	lightbox.classList.remove('open');
	document.body.style.overflow = '';
	lbImgCur.src = '';
	lbImgNext.src = '';
	if (lastFocusedElement instanceof HTMLElement) {
		lastFocusedElement.focus();
	}
}

let lbAnimating = false;

function slideAnimate(nextIndex, direction) {
	if (lbAnimating) return;
	lbAnimating = true;

	const sw = stageW();
	const outX = direction === 'next' ? -sw : sw;
	const inX = direction === 'next' ? sw : -sw;
	const cast = castData[nextIndex];

	lbImgNext.src = cast.image;
	lbImgNext.alt = cast.name;
	lbImgNext.style.transition = 'none';
	lbImgNext.style.transform = `translateX(${ inX }px)`;

	lbImgNext.getBoundingClientRect();

	lbImgCur.style.transition = 'transform .25s ease';
	lbImgCur.style.transform = `translateX(${ outX }px)`;
	lbImgNext.style.transition = 'transform .25s ease';
	lbImgNext.style.transform = 'translateX(0)';

	setTimeout(() => {
		currentCastIndex = nextIndex;
		lbImgCur.style.transition = 'none';
		lbImgCur.style.transform = 'translateX(0)';

		const revealCur = () => {
			lbImgCur.onload = lbImgCur.onerror = null;
			lbImgNext.style.transition = 'none';
			lbImgNext.style.transform = `translateX(${ inX }px)`;
			lbImgNext.src = '';
			lbAnimating = false;
		};

		lbImgCur.onload = revealCur;
		lbImgCur.onerror = revealCur;
		lbImgCur.src = cast.image;
		lbImgCur.alt = cast.name;

		if (lbImgCur.complete) revealCur();
	}, 260);
}

function showPrev() {
	slideAnimate((currentCastIndex - 1 + castData.length) % castData.length, 'prev');
}

function showNext() {
	slideAnimate((currentCastIndex + 1) % castData.length, 'next');
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', event => {
	event.stopPropagation();
	showPrev();
});
lbNext.addEventListener('click', event => {
	event.stopPropagation();
	showNext();
});
lbImgCur.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
	if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
	if (!lightbox.classList.contains('open')) return;
	if (event.key === 'Escape') closeLightbox();
	if (event.key === 'ArrowLeft') showPrev();
	if (event.key === 'ArrowRight') showNext();
	if (event.key === 'Tab') trapLightboxFocus(event);
});

function trapLightboxFocus(event) {
	const focusable = [
		lbPrev,
		lbNext,
		lbClose
	].filter(element => element && getComputedStyle(element).display !== 'none');

	if (focusable.length === 0) return;

	const first = focusable[0];
	const last = focusable[focusable.length - 1];

	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
		return;
	}

	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

let touchStartX = 0;
let touchStartY = 0;
let swipeDir = null;
let swipePreparedDir = null;
let swipeNextIndex = -1;

lightbox.addEventListener('touchstart', event => {
	if (lbAnimating) return;

	touchStartX = event.touches[0].clientX;
	touchStartY = event.touches[0].clientY;
	swipeDir = null;
	swipePreparedDir = null;
	swipeNextIndex = -1;
	lbImgCur.style.transition = 'none';
	lbImgNext.style.transition = 'none';
}, { passive: true });

lightbox.addEventListener('touchmove', event => {
	if (!lightbox.classList.contains('open') || lbAnimating) return;

	const dx = event.touches[0].clientX - touchStartX;
	const dy = event.touches[0].clientY - touchStartY;

	if (swipeDir === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
		swipeDir = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
	}
	if (swipeDir !== 'h') return;

	const sw = stageW();
	const dxDir = dx <= 0 ? 'next' : 'prev';

	if (swipePreparedDir !== dxDir) {
		swipePreparedDir = dxDir;
		if (dxDir === 'next') {
			swipeNextIndex = (currentCastIndex + 1) % castData.length;
			lbImgNext.src = castData[swipeNextIndex].image;
			lbImgNext.alt = castData[swipeNextIndex].name;
			lbImgNext.style.transform = `translateX(${ sw }px)`;
		} else {
			swipeNextIndex = (currentCastIndex - 1 + castData.length) % castData.length;
			lbImgNext.src = castData[swipeNextIndex].image;
			lbImgNext.alt = castData[swipeNextIndex].name;
			lbImgNext.style.transform = `translateX(${ -sw }px)`;
		}
	}

	lbImgCur.style.transform = `translateX(${ dx }px)`;
	lbImgNext.style.transform = dxDir === 'next'
		? `translateX(${ sw + dx }px)`
		: `translateX(${ -sw + dx }px)`;
}, { passive: true });

lightbox.addEventListener('touchend', event => {
	if (!lightbox.classList.contains('open') || lbAnimating) return;

	const dx = event.changedTouches[0].clientX - touchStartX;

	if (swipeDir === 'h' && Math.abs(dx) > 50 && swipePreparedDir !== null) {
		lbAnimating = true;
		const sw = stageW();
		const outX = dx < 0 ? -sw : sw;
		const inX = dx < 0 ? sw : -sw;
		const finalIndex = swipeNextIndex;
		const finalCast = castData[finalIndex];

		lbImgCur.style.transition = 'transform .2s ease';
		lbImgCur.style.transform = `translateX(${ outX }px)`;
		lbImgNext.style.transition = 'transform .2s ease';
		lbImgNext.style.transform = 'translateX(0)';

		setTimeout(() => {
			currentCastIndex = finalIndex;
			lbImgCur.style.transition = 'none';
			lbImgCur.style.transform = 'translateX(0)';

			const revealCur = () => {
				lbImgCur.onload = lbImgCur.onerror = null;
				lbImgNext.style.transition = 'none';
				lbImgNext.style.transform = `translateX(${ inX }px)`;
				lbImgNext.src = '';
				swipePreparedDir = null;
				swipeNextIndex = -1;
				lbAnimating = false;
			};

			lbImgCur.onload = revealCur;
			lbImgCur.onerror = revealCur;
			lbImgCur.src = finalCast.image;
			lbImgCur.alt = finalCast.name;
			if (lbImgCur.complete) revealCur();
		}, 220);
	} else {
		lbImgCur.style.transition = 'transform .2s ease';
		lbImgCur.style.transform = 'translateX(0)';

		if (swipePreparedDir !== null) {
			const sw = stageW();
			const backX = swipePreparedDir === 'next' ? sw : -sw;
			lbImgNext.style.transition = 'transform .2s ease';
			lbImgNext.style.transform = `translateX(${ backX }px)`;

			setTimeout(() => {
				lbImgNext.src = '';
				swipePreparedDir = null;
				swipeNextIndex = -1;
			}, 220);
		}
	}
}, { passive: true });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
