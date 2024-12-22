import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const directoryPath = join(__dirname, 'dist');

function addJsExtensionAndRemoveCssImports(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log('Unable to scan directory: ' + err);
      return;
    }

    files.forEach((file) => {
      const filePath = join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Recursive call for subdirectories
        addJsExtensionAndRemoveCssImports(filePath);
      } else if (file.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove lines that import .css files
        content = content.replace(/import .*['"][^'"]+\.css['"];?\n?/g, '');

        // Add `.js` to import paths that do not end with `.js` or `.css`
        content = content.replace(/(import .* from ['"])([^'"]+)(['"])/g, (match, p1, p2, p3) => {
          if (!p2.endsWith('.js') && !p2.endsWith('.css')) {
            const importPath = resolve(dir, p2);
            if (fs.existsSync(importPath + '.js') || fs.existsSync(importPath + '/index.js')) {
              return `${p1}${p2}.js${p3}`;
            }
          }
          return match;
        });

        // Add `.js` to export paths that do not end with `.js` or `.css`
        content = content.replace(/(export .* from ['"])([^'"]+)(['"])/g, (match, p1, p2, p3) => {
          if (!p2.endsWith('.js') && !p2.endsWith('.css')) {
            const exportPath = resolve(dir, p2);
            if (fs.existsSync(exportPath + '.js') || fs.existsSync(exportPath + '/index.js')) {
              return `${p1}${p2}.js${p3}`;
            }
          }
          return match;
        });

        // Write the modified content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
      }
    });
  });
}

addJsExtensionAndRemoveCssImports(directoryPath);
