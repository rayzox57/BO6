function init() {
	const elms = {};
	const container = document.getElementById('cdm_raven');
	if (!container) {
		throw new Error('Raven Container not found');
	}

	let current = null;
	const elems = container.querySelectorAll(
		'img[id^="cdm_raven_"]:not([id="cdm_raven_bg"])',
	);
	const keys = []; // Store the keys for ordered traversal

	elems.forEach((el) => {
		const id = el.getAttribute('id');
		elms[id] = el;
		keys.push(id);

		if (!current) {
			el.setAttribute('selected', 'true');
			current = el;
		}
	});

	const arrowNext = container.querySelector('#cdm_raven_next');
	const arrowPrev = container.querySelector('#cdm_raven_prev');

	if (!arrowNext || !arrowPrev) {
		throw new Error('Raven Arrows not found');
	}

	const getCurrentIndex = () => keys.indexOf(current.getAttribute('id'));

	arrowNext.addEventListener('click', () => {
		const currentIndex = getCurrentIndex();
		const nextIndex = (currentIndex + 1) % keys.length; // Circular navigation
		const nextEl = elms[keys[nextIndex]];

		current.removeAttribute('selected');
		nextEl.setAttribute('selected', 'true');
		current = nextEl;
	});

	arrowPrev.addEventListener('click', () => {
		const currentIndex = getCurrentIndex();
		const prevIndex = (currentIndex - 1 + keys.length) % keys.length; // Circular navigation
		const prevEl = elms[keys[prevIndex]];

		current.removeAttribute('selected');
		prevEl.setAttribute('selected', 'true');
		current = prevEl;
	});
}

document.addEventListener('DOMContentLoaded', init);
