// The label should be kept short for visual aesthetics.
// Type can be 'text' or 'image'. 
// If the type is set to 'image', the 'text' field will be used as alt text for accessibility.
// The imgURL should be just the filename; no need to include "/static/" in this.
// The linked images should not be larger than about 700x700 pixels, or they will not display well.

var elementsRight = {
	'1': {
		'label': 'Zebra',
		'type': 'image',
		'text': 'A Zebra',
		'imgURL': 'Zebra.jpg'
	},
	'2': {
		'label': 'Lion',
		'type': 'image',
		'text': 'A Lion',
		'imgURL': 'Lion.jpg'
	},
	'3': {
		'label': 'Bear',
		'type': 'image',
		'text': 'A Grizzly Bear',
		'imgURL': 'Bear.jpg'
	}
}

var elementsLeft = {
	'A': {
		'label': 'Carnivore',
		'type': 'text',
		'text': 'An animal that eats other animals exclusively.',
		'imgURL': ''
	},
	'B': {
		'label': 'Herbivore',
		'type': 'text',
		'text': 'An animal that eats only plants.',
		'imgURL': ''
	},
	'C': {
		'label': 'Omnivore',
		'type': 'text',
		'text': 'An animal that eats both plants and other animals.',
		'imgURL': ''
	}
}