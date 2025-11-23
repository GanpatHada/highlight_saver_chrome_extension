import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, sep } from 'path';

const filesToCopy = [
  'public/manifest.json',
  'public/content.js',
  'public/content.css',
  'public/background.js',
  'public/icon16.png',
  'public/icon48.png',
  'public/icon128.png'
];

async function copyExtensionFiles() {
  console.log('Copying extension files to dist folder...');
  
  try {
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      await mkdir('dist');
    }
    
    // Copy each file
    for (const file of filesToCopy) {
      const sourcePath = file;
      const destPath = join('dist', file.replace('public/', ''));
      
      // Ensure destination directory exists
      const destDir = destPath.substring(0, destPath.lastIndexOf(sep));
      if (destDir && !existsSync(destDir)) {
        await mkdir(destDir, { recursive: true });
      }
      
      await copyFile(sourcePath, destPath);
      console.log(`✓ Copied ${file} to dist/`);
    }
    
    console.log('✅ All extension files copied successfully!');
  } catch (error) {
    console.error('❌ Error copying extension files:', error);
    process.exit(1);
  }
}

copyExtensionFiles();
