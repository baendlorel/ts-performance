import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const clearFtest = () => {
  console.time('Clearing ftest');
  const testFilePath = join(__dirname, '..', 'src', 'performance');
  const list = readdirSync(testFilePath);
  list.forEach((file) => {
    if (file.endsWith('.ts')) {
      const filePath = join(testFilePath, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        if (!content.includes('measure.ftest')) {
          return;
        }
        writeFileSync(filePath, content.replaceAll('measure.ftest', 'measure.test'));
        console.log(`Cleared content of ${file}`);
      } catch (error) {
        console.error(`Error clearing ${file}: ${error.message}`);
      }
    }
  });
  console.timeEnd('Clearing ftest');
};

const main = () => {
  const content = readFileSync(join(__dirname, 'template.ts'), 'utf-8');
  const newFileName = process.argv[2];
  if (!newFileName) {
    console.error('Please provide a file name for the new test script.');
    return;
  }

  const newFilePath = join(__dirname, '..', 'src', 'performance', `${newFileName}.ts`);
  if (existsSync(newFilePath)) {
    console.error(`File ${newFileName}.ts already exists. Please choose a different name.`);
    return;
  }

  clearFtest();
  const testName = newFileName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const newContent = content.replace('{name}', testName);

  try {
    writeFileSync(newFilePath, newContent);
    console.log(`New test script created: ${newFilePath}`);
  } catch (error) {
    console.error(`Error creating new test script: ${error.message}`);
  }
  console.log(
    `You can now edit ${newFileName}.ts in the src/performance directory to add your performance tests.`
  );
};

main();
