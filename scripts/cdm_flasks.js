const flasks = {};

function init() {
	for (i = 1; i <= 20; i++) {
		flasks[i] = {};

		flasks[i][1] = {};
		flasks[i][1]['target'] = 'img[class^="logo"]';
		flasks[i][1]['keys_values'] = {};
		flasks[i][1]['keys_values']['src'] = `./public/imgs/flasks/${i}.png`;
	}

	let code = '';
	let lock = false;

	// check if inside the url there is a flask code

	const builder = new BuildElem('cdm_flask', 'cdm_flasks');
	builder.newElements(flasks);
	const dragDrop = new DragDrop(
		'cdm_flasks',
		1,
		'cdm_flask_copy',
		'cdm_flask_paste',
		'cdm_flask',
		'cdm_flask_lock',
		false,
		'Lock',
		'Unlock',
	);
	dragDrop.autoAddElementsList(builder.getElements());
	dragDrop.applyCodeByUrl();
}

document.addEventListener('DOMContentLoaded', init);
