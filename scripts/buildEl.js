class BuildElem {
	constructor(idTemplate, idContainer = '', elementIdShift = 1) {
		this.container;
		this.idTemplate = idTemplate;

		const el = document.getElementById(idTemplate);
		if (!el) {
			throw new Error(`Element with id ${idTemplate} not found`);
		}

		if (idContainer && idContainer !== '') {
			const container = document.getElementById(idContainer);
			if (!container) {
				throw new Error(`Container with id ${idContainer} not found`);
			}
			this.idContainer = idContainer;
			this.container = container;
		} else {
			this.container = document.body;
		}

		this.template = el.cloneNode(true);
		el.remove();
		this.elementIdShift = elementIdShift || 0;
		this.elements = {};
	}

	getLastId() {
		return Object.keys(this.elements).length + this.elementIdShift;
	}

	newElement(keysValues) {
		const el = this.template.cloneNode(true);
		el.removeAttribute('id');

		for (const [id, targetKeysValues] of Object.entries(keysValues)) {
			let targets = [el];

			const keysValues = targetKeysValues?.keys_values;
			if (!typeof keysValues === 'object') continue;

			const target = targetKeysValues?.target;

			if (typeof target === 'string') {
				const tempTargets = el.querySelectorAll(target);
				if (tempTargets.length > 0) {
					targets = tempTargets;
				}
			} else if (Array.isArray(target)) {
				const tempTargets = [];
				target.forEach((t) => {
					const tt = el.querySelectorAll(t);
					if (tt.length > 0) {
						tempTargets.push(...tt);
					}
				});
				if (tempTargets.length > 0) {
					targets = tempTargets;
				}
			}

			for (const [key, value] of Object.entries(keysValues)) {
				if (key === 'class') {
					if (typeof value === 'string') {
						targets.forEach((t) => t.classList.add(value));
					} else if (Array.isArray(value)) {
						targets.forEach((t) =>
							value.forEach((c) => t.classList.add(c)),
						);
					}
				} else {
					if (typeof value === 'string') {
						targets.forEach((t) => t.setAttribute(key, value));
					} else if (Array.isArray(value)) {
						targets.forEach((t) =>
							value.forEach((v) => t.setAttribute(key, v)),
						);
					}
				}
			}
		}

		const lastId = this.getLastId();
		el.id = `${this.idTemplate}${lastId}`;
		el.setAttribute(`${this.idTemplate}`, lastId);
		this.container.appendChild(el);
		this.elements[lastId] = el;
	}

	newElements(list) {
		for (const [id, keysValues] of Object.entries(list)) {
			this.newElement(keysValues);
		}
	}

	removeElement(id) {
		const el = this.elements[id];
		if (el) {
			this.container.removeChild(el);
			delete this.elements[id];
		}
	}

	getElement(id) {
		return this.elements[id];
	}

	getElements() {
		return this.elements;
	}
}
