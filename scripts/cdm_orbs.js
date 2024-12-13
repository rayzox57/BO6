const orbs = {};

function init() {
	for (let i = 1; i <= 4; i++) {
		orbs[i] = {
			1: {
				target: 'img[class^="logo"]',
				keys_values: { src: `./public/imgs/orbs/${i}.png` },
			},
		};
	}

	const builder = new BuildElem('cdm_orb', 'cdm_orbs');
	builder.newElements(orbs);
	const dragDrop = new DragDrop(
		'cdm_orbs',
		1,
		'cdm_orb_copy',
		'cdm_orb_paste',
		'cdm_orb',
		'cdm_orb_lock',
		false,
		'Lock',
		'Unlock',
	);
	dragDrop.autoAddElementsList(builder.getElements());
	dragDrop.applyCodeByUrl();
}

document.addEventListener('DOMContentLoaded', init);
