document.addEventListener('DOMContentLoaded', () => {
	function init() {
		let isLocked = false;
		let currentElement = null;
		const elementMap = {};
		const keys = [];

		// Helper function to safely get an element
		const getElement = (selector, errorMessage) => {
			const element = document.querySelector(selector);
			if (!element) throw new Error(errorMessage);
			return element;
		};

		// Fetch essential DOM elements
		const container = getElement('#cdm_raven', 'Raven Container not found');
		const lockButton = getElement(
			'#cdm_raven_lock',
			'Raven Lock Button not found',
		);
		const copyButton = getElement(
			'#cdm_raven_copy',
			'Raven Copy Button not found',
		);
		const pasteButton = getElement(
			'#cdm_raven_paste',
			'Raven Paste Button not found',
		);
		const arrowNext = getElement(
			'#cdm_raven_next',
			'Raven Next Arrow not found',
		);
		const arrowPrev = getElement(
			'#cdm_raven_prev',
			'Raven Prev Arrow not found',
		);

		// Initialize elements and keys
		container
			.querySelectorAll('img[id^="cdm_raven_"]:not([id="cdm_raven_bg"])')
			.forEach((el) => {
				const id = el.id;
				elementMap[id] = el;
				keys.push(id);

				if (!currentElement) {
					el.setAttribute('selected', 'true');
					currentElement = el;
				}
			});

		// Get the current index of the selected element
		const getCurrentIndex = () => keys.indexOf(currentElement.id);

		// Lock and unlock functionality
		const toggleLock = () => {
			isLocked = !isLocked;
			lockButton.textContent = isLocked ? 'Unlock' : 'Lock';
			container.setAttribute('lock', isLocked);
			if (!isLocked) container.removeAttribute('lock');
		};

		// Clipboard actions
		const copyToClipboard = async () => {
			if (!currentElement) return;
			const currentIndex = getCurrentIndex();
			if (currentIndex === -1) return;

			try {
				await navigator.clipboard.writeText(currentIndex);
				alert('Copied to clipboard');
			} catch {
				alert(`Failed to copy. Here is the code: ${currentIndex}`);
			}
		};

		const pasteFromClipboard = async () => {
			let code;
			try {
				code = await navigator.clipboard.readText();
			} catch {
				code = prompt('Paste the code:');
			}

			if (code) {
				const newIndex = parseInt(code, 10);
				if (isNaN(newIndex) || newIndex < 0 || newIndex >= keys.length)
					return;

				const newElement = elementMap[keys[newIndex]];
				if (!newElement || currentElement === newElement) return;

				currentElement.removeAttribute('selected');
				newElement.setAttribute('selected', 'true');
				currentElement = newElement;
			}
		};

		// Navigation functionality
		const navigate = (direction) => {
			if (isLocked) return;

			const currentIndex = getCurrentIndex();
			const newIndex =
				(currentIndex + direction + keys.length) % keys.length;
			const newElement = elementMap[keys[newIndex]];

			currentElement.removeAttribute('selected');
			newElement.setAttribute('selected', 'true');
			currentElement = newElement;
		};

		// Attach event listeners
		lockButton.addEventListener('click', () => {
			const unlockAll = document.getElementById('unlock_all');
			const lockAll = document.getElementById('lock_all');
			if (unlockAll) unlockAll.disabled = false;
			if (lockAll) lockAll.disabled = false;
			toggleLock();
		});
		copyButton.addEventListener('click', copyToClipboard);
		pasteButton.addEventListener('click', pasteFromClipboard);
		arrowNext.addEventListener('click', () => navigate(1));
		arrowPrev.addEventListener('click', () => navigate(-1));

		// External lock/unlock events
		document.addEventListener('btn-lockAll', () => {
			console.log('btn-lockAll');
			if (!isLocked) toggleLock();
		});

		document.addEventListener('btn-unlockAll', () => {
			console.log('btn-unlockAll');
			if (isLocked) toggleLock();
		});

		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has(`${container.id}_Code`)) {
			const code = urlParams.get(`${container.id}_Code`);
			const newIndex = parseInt(code, 10);
			if (isNaN(newIndex) || newIndex < 0 || newIndex >= keys.length)
				return;

			const newElement = elementMap[keys[newIndex]];
			if (!newElement || currentElement === newElement) return;

			currentElement.removeAttribute('selected');
			newElement.setAttribute('selected', 'true');
			currentElement = newElement;
		}
		if (urlParams.has(`${container.id}_Lock`)) {
			const lock = urlParams.get(`${container.id}_Lock`);
			if (lock === 'true') toggleLock();
		}
	}

	init();
});
