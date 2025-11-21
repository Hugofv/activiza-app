const transformer = require('react-native-svg-transformer/expo');
const fs = require('fs');

const svgContent = fs.readFileSync('./assets/images/logo.svg', 'utf8');
console.log('Testing SVG transformation...');
console.log('SVG length:', svgContent.length);
console.log('Has CSS vars:', svgContent.includes('var(--'));
console.log('Has style attr:', svgContent.includes('style='));
