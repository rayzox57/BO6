const traps = {};

function init() {
	for (let i = 1; i <= 4; i++) {
		traps[i] = {
			1: {
				target: 'img[class^="logo"]',
				keys_values: { src: `./public/imgs/traps/${i}.png` },
			},
		};
	}

	const builder = new BuildElem('cdm_trap', 'cdm_traps');
	builder.newElements(traps);
	const dragDrop = new DragDrop(
		'cdm_traps',
		1,
		'cdm_trap_copy',
		'cdm_trap_paste',
		'cdm_trap',
		'cdm_trap_lock',
		false,
		'Lock',
		'Unlock',
	);
	dragDrop.autoAddElementsList(builder.getElements());
	dragDrop.applyCodeByUrl();
}

document.addEventListener('DOMContentLoaded', init);
