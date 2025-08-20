import { Utils } from '@elemental/utils';
import { Database } from '@elemental/database';

import { ContentDoc } from '@inclusio/documents';

/**
 * Pre-fab user document list for testing
 */
const SAMPLE_CONTENT_DOCS = [
	{
		_id: '',
		name: 'Big and little dipper',
		description: 'Diagram of the 2 constellations, the Big Dipper and the Little Dipper.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['astronomy'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-dippers.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Cell structure',
		description: 'Diagram of plant cell structure.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['biology'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'biology',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-cell-structure.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Volcano',
		description: 'Cross-section diagram of a volcano.',
		assistiveTechniques: ['audio_tactile'],
		imageType: ['diagram'],
		publisher: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'geology',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-volcano.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Human Respiratory System',
		description: 'Diagram of the respiratory system showing the airways and lungs.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['biology'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'biology',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-respiration.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Comet',
		description: '',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['astronomy'],
		imageTypes: ['diagram'],
		publishers: ['vital'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'astronomy',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-comet.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Structure of a Flower',
		description: 'Cross section of a flower.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['biology'],
		imageTypes: ['diagram'],
		publishers: ['vital'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'biology',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-flower-structure.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Germination',
		// eslint-disable-next-line no-multi-str
		description: 'Diagram of the 5 steps of the seed germination process. \
			Step 1. Imbibition: retention of water by the dry seed. \
			Step 2. Breath: can be anaerobic at first however soon they turn vigorous as oxygen begins entering the seed. \
			Step 3. Impact of light on germination: Plants extraordinarily fluctuate because of light relating to germination. \
			The seeds answering light for germination are called photoelastic. \
			Step 4. Preparation of Reserves during Germination and Role of Growth Regulators. \
			Step 5. Improvement of Embryo Axis into Seedling: cells of the undeveloped organism \
			in the developing regions become exceptionally dynamic metabolically, \
			after the movement of food and its resulting absorption',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['biology'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'biology',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-germination.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'moon',
		description: 'Diagram of the moon.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['astronomy'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-moon.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Solar Eclipse',
		description: 'Diagram of a solar eclipse.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['astronomy'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-solar-eclipse.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Solar System',
		description: 'Diagram of the structure of the solar system.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['astronomy'],
		imageTypes: ['diagram'],
		publishers: ['unar'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-solar-system.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Subduction zone',
		description: 'Diagram of an subduction zone.',
		assistiveTechniques: ['audio_tactile'],
		imageTypes: ['diagram'],
		publishers: ['vital'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		_attachments: {
			content: {
				data: 'braille-science-subduction-zone.jpeg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'belgium',
		description: 'Map of Belgium.',
		assistiveTechniques: ['audio_tactile', 'braille'],
		imageTypes: ['map'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'maps',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-maps-belgium.jpg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'world map',
		description: 'Map of the Earth.',
		assistiveTechniques: ['audio_tactile', 'braille'],
		imageTypes: ['map'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-maps-world.jpg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Ireland',
		description: 'Map of Ireland.',
		assistiveTechniques: ['audio_tactile', 'braille', 'sonification'],
		imageTypes: ['map'],
		publishers: ['vital'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// 	'maps',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-maps-ireland.jpg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'Deutschland',
		description: 'Landkarte von Deutschland.',
		assistiveTechniques: ['audio_tactile', 'braille'],
		imageTypes: ['map'],
		publishers: ['viewplus'],
		languages: ['de'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'maps',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-maps-germany.jpg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'United States of America',
		description: 'The USA, with each state.',
		assistiveTechniques: ['audio_tactile', 'braille'],
		imageTypes: ['map'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'maps',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-maps-usa.jpg',
				contentType: '',
			},
		},
	},
	{
		_id: '',
		name: 'The Sun',
		description: 'Diagram of the structure of the sun in cross-section.',
		assistiveTechniques: ['audio_tactile'],
		subjects: ['astronomy'],
		imageTypes: ['diagram'],
		publishers: ['viewplus'],
		visibility: 'private',
		updateTime: '',
		// collections: [
		// 	'science',
		// ],
		// authors: [
		// 	{
		// 		name: 'ViewPlus',
		// 		company: 'ViewPlus',
		// 	},
		// ],
		_attachments: {
			content: {
				data: 'braille-science-sun.jpeg',
				contentType: '',
			},
		},
	},
];


/**
 * Insert sample documents into database
 */
export async function storeSampleDocs(db: Database): Promise<void> {
	for (let index = 0; index < SAMPLE_CONTENT_DOCS.length; index++) {
		const sampleDoc = SAMPLE_CONTENT_DOCS[index] as unknown as ContentDoc;
		Object.setPrototypeOf(sampleDoc, ContentDoc.prototype);
		if (! sampleDoc.languages) {
			sampleDoc.languages = ['en'];
		}
		sampleDoc.updateTime = Utils.isoDateTime();

		for (const attachmentName of sampleDoc.attachmentNames) {
			try {
				const filename = (sampleDoc as any)._attachments[attachmentName].data;
				const blob = await (await fetch(`/samples/${attachmentName}/${filename}`)).blob();
				sampleDoc.addAttachment(attachmentName, blob);
			}
			catch (error) {
				console.error('Unable to load sample attachment', attachmentName, sampleDoc.name);
				sampleDoc.deleteAttachment(attachmentName);
			}
		}

		try {
			await db.create(sampleDoc, `sample-${index}`);
		}
		catch (error) {
			console.error('Unable to store sample doc', index, error);
		}
	}
}
