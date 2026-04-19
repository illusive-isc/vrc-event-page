const fs = require('fs');
const path = require('path');

const castDir = path.join(__dirname, '../images/cast');
const outputJson = path.join(__dirname, '../data/cast.json');

function getCastList() {
	const files = fs.readdirSync(castDir).filter(file => file.endsWith('.jpg'));
	const numbered = [];

	files.forEach(file => {
		const match = file.match(/^([0-9]+)_(.+)\.jpg$/);
		if (!match) return;

		numbered.push({
			order: parseInt(match[1], 10),
			name: match[2],
			image: `images/cast/${ file }`
		});
	});

	numbered.sort((a, b) => a.order - b.order);
	return numbered;
}

function writeCastJson(castList) {
	const jsonStr = JSON.stringify(castList, null, 2).replace(/[^\u0000-\u007F]/g, char => {
		return `\\u${ char.charCodeAt(0).toString(16).padStart(4, '0') }`;
	});
	fs.writeFileSync(outputJson, jsonStr, 'utf8');
	console.log('Updated data/cast.json');
}

writeCastJson(getCastList());
