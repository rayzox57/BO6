class DragDrop {
	static instances = new Map();
	constructor(
		containerId,
		idShift = 1,
		copyCodeButtonId = '',
		pasteCodeButtonId = '',
		copyCodeCustomAttribute = 'data-id',
		lockButtonId = '',
		defaultLock = false,
		lockButtonUnlocked = 'Lock',
		lockButtonLocked = 'Unlock',
	) {
		if (DragDrop.instances.has(containerId)) {
			return DragDrop.instances.get(containerId);
		}

		this.containerId = containerId;
		this.lock = defaultLock;
		this.idShift = idShift;
		this.copyCodeCustomAttribute = copyCodeCustomAttribute;

		this.container = document.getElementById(containerId);

		if (!this.container) {
			throw new Error(`Container with id ${containerId} not found`);
		}

		if (lockButtonId !== '') {
			this.lockButton = document.getElementById(lockButtonId);
			if (!this.lockButton) {
				throw new Error(
					`Lock button with id ${lockButtonId} not found`,
				);
			}

			this.lockButtonUnlocked = lockButtonUnlocked;
			this.lockButtonLocked = lockButtonLocked;
			this.lockButton.innerHTML = this.lock
				? this.lockButtonLocked
				: this.lockButtonUnlocked;

			if (this.lock) {
				this.container.setAttribute('lock', true);
			}

			this.lockButton.addEventListener('click', () => {
				const unlockAll = document.getElementById('unlock_all');
				const lockAll = document.getElementById('lock_all');
				if (unlockAll) unlockAll.disabled = false;
				if (lockAll) lockAll.disabled = false;
				this.switchLock();
			});
		}

		if (copyCodeButtonId !== '') {
			this.copyCodeButton = document.getElementById(copyCodeButtonId);
			if (!this.copyCodeButton) {
				throw new Error(
					`Copy code button with id ${copyCodeButtonId} not found`,
				);
			}

			this.copyCodeButton.addEventListener(
				'click',
				this.copyCode.bind(this),
			);
		}

		if (pasteCodeButtonId !== '') {
			this.pasteCodeButton = document.getElementById(pasteCodeButtonId);
			if (!this.pasteCodeButton) {
				throw new Error(
					`Paste code button with id ${pasteCodeButtonId} not found`,
				);
			}

			this.pasteCodeButton.addEventListener(
				'click',
				this.pasteCode.bind(this),
			);
		}

		this.elements = {};
		this.draggedElement = null;
		this.cloneElement = null;
		this.offsetX = 0;
		this.offsetY = 0;

		this.dragHandler = this.drag.bind(this);
		this.stopDragHandler = this.stopDrag.bind(this);
		this.touchStartHandler = this.touchStart.bind(this);
		this.touchMoveHandler = this.touchMove.bind(this);
		this.touchEndHandler = this.touchEnd.bind(this);

		DragDrop.instances.set(containerId, this);
	}

	switchLock() {
		this.lock = !this.lock;
		this.updateLock();
	}

	updateLock() {
		if (this.lockButton)
			this.lockButton.innerHTML = this.lock
				? this.lockButtonLocked
				: this.lockButtonUnlocked;
		if (this.lock) this.container.setAttribute('lock', true);
		else this.container.removeAttribute('lock');
		this.stopDrag();
	}

	autoAddElementsList(elementsList, code = '') {
		for (const [id, element] of Object.entries(elementsList)) {
			this.addEl(element);
		}
		if (code !== '') this.applyCode(code);
	}

	autoAddElements(querySelector) {
		const elements = document.querySelectorAll(querySelector);
		elements.forEach((el) => this.addEl(el));
	}

	setDataId(id, el) {
		el.setAttribute('data-id', id);
		el.style = `--data-order: ${id}`;
	}

	addEl(el) {
		const lastId = Object.keys(this.elements).length + this.idShift;
		this.elements[lastId] = el;
		this.setDataId(lastId, el);

		if (!this.container.contains(el)) {
			this.container.appendChild(el);
		}

		this.fixAllPositions();

		el.addEventListener('mousedown', this.startDrag.bind(this));
		el.addEventListener('touchstart', this.touchStartHandler.bind(this));
		el.addEventListener('mouseenter', this.dragHover.bind(this));
		el.addEventListener('mouseleave', this.dragEndHover.bind(this));
	}

	removeEl(el) {
		const id = el.getAttribute('data-id');
		if (!id || !this.elements[id]) return;

		el.removeEventListener('mousedown', this.startDrag.bind(this));
		el.removeEventListener('touchstart', this.touchStartHandler.bind(this));
		el.removeEventListener('mouseenter', this.dragHover.bind(this));
		el.removeEventListener('mouseleave', this.dragEndHover.bind(this));

		delete this.elements[id];
		this.container.removeChild(el);
		this.fixAllPositions();
	}

	dragHover(e) {
		if (!this.draggedElement) return;

		const el = e.target;
		if (el && el !== this.draggedElement) {
			el.setAttribute('hover', true);
		}
	}

	dragEndHover(e) {
		const el = e.target;
		if (el) {
			el.removeAttribute('hover');
		}
	}

	fixAllPositions() {
		const sortedElements = Object.values(this.elements).sort((a, b) => {
			return (
				parseInt(a.getAttribute('data-id')) -
				parseInt(b.getAttribute('data-id'))
			);
		});
		sortedElements.forEach((el) => {
			el.removeAttribute('hover');
			this.container.appendChild(el);
		});
	}

	startDrag(e) {
		if (this.lock) return;
		if (this.draggedElement) return;

		const element = e.target;
		const id = element.getAttribute('data-id');

		if (!id || !this.elements[id]) {
			console.error(`Element with id ${id} not found`);
			return;
		}

		this.draggedElement = this.elements[id];
		this.cloneElement = this.draggedElement.cloneNode(true);
		this.draggedElement.setAttribute('dragged', true);
		this.cloneElement.setAttribute('clone', true);
		this.cloneElement.style.position = 'absolute';
		this.cloneElement.style.pointerEvents = 'none';
		this.container.style.cursor = 'grabbing';

		const rect = this.draggedElement.getBoundingClientRect();
		// Calculer le décalage pour centrer le rectangle sous la souris
		this.offsetX = rect.width / 2;
		this.offsetY = rect.height / 2;

		this.container.appendChild(this.cloneElement);

		document.addEventListener('mousemove', this.dragHandler);
		document.addEventListener('touchmove', this.touchMoveHandler);
		document.addEventListener('mouseup', this.stopDragHandler);
		document.addEventListener('touchend', this.touchEndHandler);

		const containerRect = this.container.getBoundingClientRect();
		const x = e.clientX - containerRect.left - this.offsetX;
		const y = e.clientY - containerRect.top - this.offsetY;

		this.cloneElement.style.left = `${x}px`;
		this.cloneElement.style.top = `${y}px`;
	}

	touchStart(e) {
		if (this.lock) return;
		this.startDrag(e.touches[0]);
		this.startMobileWatchCollision(e);
	}

	touchEnd(e) {
		if (this.mobileCollideInterval) {
			clearInterval(this.mobileCollideInterval);
		}
		this.stopDrag();
	}

	startMobileWatchCollision() {
		if (this.mobileCollideInterval) {
			clearInterval(this.mobileCollideInterval);
		}

		if (!this.cloneElement || !this.draggedElement) {
			return;
		}

		let closestEl = null;

		document.body.style.overflowY = 'hidden';

		// Utility function for collision detection
		const isCollision = (rect1, rect2) =>
			rect1.left <= rect2.right &&
			rect1.right >= rect2.left &&
			rect1.top <= rect2.bottom &&
			rect1.bottom >= rect2.top;

		// Set up collision detection interval
		this.mobileCollideInterval = setInterval(() => {
			const rect = this.cloneElement.getBoundingClientRect();

			// Center of the element
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			// Define the bounding rectangle for the center zone
			const centerCloneRect = {
				left: centerX - this.offsetX,
				top: centerY - this.offsetY,
				right: centerX + this.offsetX,
				bottom: centerY + this.offsetY,
			};

			let newClosestEl = null;

			// Iterate through elements to find collisions
			for (const [id, element] of Object.entries(this.elements)) {
				if (element === this.draggedElement) continue;

				const elementRect = element.getBoundingClientRect();
				if (isCollision(centerCloneRect, elementRect)) {
					newClosestEl = element;
					break;
				}
			}

			// Update the hover attribute only when the closest element changes
			if (closestEl !== newClosestEl) {
				if (closestEl) closestEl.removeAttribute('hover');
				if (newClosestEl) newClosestEl.setAttribute('hover', true);
				closestEl = newClosestEl;
			}
		}, 1);
	}

	touchMove(e) {
		this.drag(e.touches[0]);
	}

	drag(e) {
		if (this.lock) return this.stopDrag();
		if (!this.cloneElement) return;

		const containerRect = this.container.getBoundingClientRect();
		const x = e.clientX - containerRect.left - this.offsetX;
		const y = e.clientY - containerRect.top - this.offsetY;

		this.cloneElement.style.left = `${x}px`;
		this.cloneElement.style.top = `${y}px`;
	}

	stopDrag() {
		if (!this.draggedElement || !this.cloneElement) return;

		document.body.style.overflowY = 'auto';

		if (this.mobileCollideInterval) {
			clearInterval(this.mobileCollideInterval);
		}

		const hoverEl = this.container.querySelector('[hover="true"]');
		if (hoverEl) {
			const draggedId = this.draggedElement.getAttribute('data-id');
			const hoverId = hoverEl.getAttribute('data-id');

			this.setDataId(hoverId, this.draggedElement);
			this.setDataId(draggedId, hoverEl);

			this.elements[draggedId] = hoverEl;
			this.elements[hoverId] = this.draggedElement;
		}
		this.container.style = '';
		this.container.removeChild(this.cloneElement);
		this.cloneElement = null;
		this.draggedElement.removeAttribute('dragged');
		this.draggedElement = null;

		document.removeEventListener('mousemove', this.dragHandler);
		document.removeEventListener('touchmove', this.touchMoveHandler);
		document.removeEventListener('mouseup', this.stopDragHandler);
		document.removeEventListener('touchend', this.stopDragHandler);

		this.fixAllPositions();
	}

	generateCode() {
		let code = '';
		const customAttribute = this.copyCodeCustomAttribute;

		for (const [id, element] of Object.entries(this.elements)) {
			const dataId = element.getAttribute(customAttribute);
			code += `${dataId},`;
		}
		code = code.slice(0, -1);
		// convert to hex
		return code.toBase64();
	}

	applyCode(code) {
		// first check if the code is valid
		const codeDec = code.fromBase64();
		const codeArray = codeDec.split(',').map(Number);
		if (codeArray.length !== Object.keys(this.elements).length) {
			alert(
				'Invalid code format. Please use the following format: "1,2,3,4,5,6..."',
			);
			return false;
		}

		// for each code
		for (let i = 0; i < codeArray.length; i++) {
			const id = codeArray[i];
			const element = this.container.querySelector(
				`[${this.copyCodeCustomAttribute}="${id}"]`,
			);
			if (!element) {
				alert('Invalid code format. Some ids are invalid.');
				return false;
			}

			const id_order = i + this.idShift;
			this.elements[id_order] = element;
			this.setDataId(id_order, element);
		}

		this.fixAllPositions();
		return true;
	}

	copyCode() {
		const code = this.generateCode();
		if (navigator.clipboard) {
			navigator.clipboard.writeText(code).catch((err) => {
				alert(`Failed to copy, here is the code: ${code}`);
			});
		} else {
			alert(`Clipboard API not supported, here is the code: ${code}`);
		}
	}

	pasteCode() {
		navigator.clipboard
			.readText()
			.then((text) => {
				this.applyCode(text);
			})
			.catch((err) => {
				let input = prompt('Paste the code:');
				if (input) this.applyCode(input);
			});
	}

	applyCodeByUrl() {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has(`${this.containerId}_Code`)) {
			this.applyCode(urlParams.get(`${this.containerId}_Code`));
		}
		if (urlParams.has(`${this.containerId}_Lock`)) {
			this.lock =
				urlParams.get(`${this.containerId}_Lock`) === 'true'
					? true
					: false;
			this.updateLock();
		}
	}

	static generateUrlParams() {
		// get the current url and remove all query parameters
		const url = new URL(window.location.href);
		url.search = '';

		// foreach instance, get the code and the lock state
		for (const instance of DragDrop.instances.values()) {
			url.searchParams.append(
				`${instance.containerId}_Code`,
				instance.generateCode(),
			);
			url.searchParams.append(
				`${instance.containerId}_Lock`,
				instance.lock,
			);
		}

		// Raven raw add
		const ravenContainer = document.getElementById('cdm_raven');
		if (ravenContainer) {
			const selected = ravenContainer.querySelector(
				'img[selected="true"]',
			);
			if (selected) {
				const ravenId = selected.getAttribute('raven_id');
				if (ravenId && parseInt(ravenId, 10) >= 0) {
					url.searchParams.append('cdm_raven_Code', ravenId);
				}
			}
		}

		const ravenButtonLock = document.getElementById('cdm_raven_lock');
		if (ravenButtonLock) {
			const lock = ravenButtonLock.innerHTML === 'Unlock';
			url.searchParams.append('cdm_raven_Lock', lock);
		}

		if (navigator.clipboard) {
			navigator.clipboard.writeText(url.href).catch((err) => {
				alert(`Failed to copy, here is the url: ${url.href}`);
			});
		} else {
			alert(`Clipboard API not supported, here is the url: ${url.href}`);
		}
	}

	static lockAll(lock, unlock) {
		for (const instance of DragDrop.instances.values()) {
			instance.lock = true;
			instance.updateLock();
		}

		if (lock) lock.disabled = true;
		if (unlock) unlock.disabled = false;
	}

	static unlockAll(lock, unlock) {
		for (const instance of DragDrop.instances.values()) {
			instance.lock = false;
			instance.updateLock();
		}
		if (lock) lock.disabled = false;
		if (unlock) unlock.disabled = true;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const buttonShare = document.getElementById('generate_url');
	if (buttonShare) {
		buttonShare.addEventListener('click', DragDrop.generateUrlParams);
	}

	const buttonLockAll = document.getElementById('lock_all');
	const buttonUnlockAll = document.getElementById('unlock_all');

	if (buttonLockAll) {
		// create custom event
		DragDrop.lockAllEvent = new CustomEvent('btn-lockAll');
		buttonLockAll.addEventListener('click', () => {
			// emit custom event
			document.dispatchEvent(DragDrop.lockAllEvent);
			DragDrop.lockAll(buttonLockAll, buttonUnlockAll);
		});
	}

	if (buttonUnlockAll) {
		// create custom event
		DragDrop.unlockAllEvent = new CustomEvent('btn-unlockAll');
		buttonUnlockAll.addEventListener('click', () => {
			// emit custom event
			document.dispatchEvent(DragDrop.unlockAllEvent);
			DragDrop.unlockAll(buttonLockAll, buttonUnlockAll);
		});
	}
});
