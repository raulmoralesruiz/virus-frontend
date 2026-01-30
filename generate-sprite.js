const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, 'public', 'assets');
const outputDir = path.join(rootDir, 'src', 'app', 'core', 'components', 'svg-sprite');
const outputFile = path.join(outputDir, 'svg-sprite.component.ts');

const categories = {
  'organs': 'organ',
  'modifiers': 'modifier',
  'treatment': 'treatment'
};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let symbols = '';

function processFile(filePath, id) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Simple regex to extract viewBox. 
  // Note: this assumes standard SVG formatting which seems to be the case.
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'; // default fallback
  
  // Extract content inside <svg> tags
  // We'll strip the declaration and the outer svg tag
  let innerContent = content.replace(/<\?xml.*?\?>/g, '')
                            .replace(/<!DOCTYPE.*?>/g, '')
                            .replace(/<svg[^>]*>/, '')
                            .replace(/<\/svg>/, '');
                            
  // Remove namespaced attributes that angular hates (sodipodi, inkscape, etc)
  // This simplistic regex approach might be brittle but let's try to remove known bad tags/attributes
  
  // Remove metadata, defs, sodipodi:namedview completely
  innerContent = innerContent.replace(/<metadata[\s\S]*?<\/metadata>/g, '');
  innerContent = innerContent.replace(/<defs[\s\S]*?<\/defs>/g, '');
  innerContent = innerContent.replace(/<sodipodi:namedview[\s\S]*?\/>/g, '');
  
  // Remove attributes starting with xmlns:, sodipodi:, inkscape:
  // Using a loop to catch them all or a global regex
  innerContent = innerContent.replace(/\s(xmlns|sodipodi|inkscape):[a-zA-Z0-9]+="[^"]*"/g, '');
  innerContent = innerContent.replace(/\s[a-z]+:[a-z]+="[^"]*"/g, ''); // Generic namespaced attr removal

  // Clean up whitespace
  innerContent = innerContent.trim();

  symbols += `
      <symbol id="${id}" viewBox="${viewBox}">
        ${innerContent}
      </symbol>`;
}

for (const [dirName, prefix] of Object.entries(categories)) {
  const dirPath = path.join(assetsDir, dirName);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.svg'));
    for (const file of files) {
      const name = path.basename(file, '.svg');
      const id = `icon-${prefix}-${name}`;
      processFile(path.join(dirPath, file), id);
      console.log(`Processed ${id}`);
    }
  }
}

const componentContent = `import { Component } from '@angular/core';

@Component({
  selector: 'svg-sprite',
  standalone: true,
  template: \`
    <svg style="display: none;" xmlns="http://www.w3.org/2000/svg">
      <defs>${symbols}
      </defs>
    </svg>
  \`
})
export class SvgSpriteComponent {}
`;

fs.writeFileSync(outputFile, componentContent);
console.log(`Generated sprite at ${outputFile}`);
