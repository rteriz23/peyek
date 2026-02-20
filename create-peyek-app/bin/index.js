#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.bold.blue('\n🚀 Welcome to P.E.Y.E.K Project Scaffolding 🚀\n'));

async function run() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'What is your project named?',
            default: 'my-peyek-app'
        },
        {
            type: 'list',
            name: 'framework',
            message: 'Which framework/environment are you using?',
            choices: ['Vanilla HTML/JS', 'Laravel (Blade)', 'CodeIgniter (PHP)', 'React', 'Vue']
        }
    ]);

    const projectPath = path.join(process.cwd(), answers.projectName);

    console.log(`\nCreating ${chalk.green(answers.projectName)} in ${projectPath}...`);

    // Basic scaffolding logic
    try {
        if (fs.existsSync(projectPath)) {
            console.log(chalk.red(`\nError: Directory ${answers.projectName} already exists!`));
            process.exit(1);
        }

        fs.mkdirSync(projectPath);

        // Depending on framework, copy correct template
        // For this prototype, we'll write a basic Vanilla HTML setup directly
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${answers.projectName}</title>
  <!-- Load P.E.Y.E.K Bundles -->
  <script src="https://unpkg.com/@rterizz23/peyek-core@latest/dist/peyek.core.min.js"></script>
  <script src="https://unpkg.com/@rterizz23/peyek-ui-builder@latest/dist/peyek.ui-builder.min.js"></script>
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h1>Welcome to ${answers.projectName}</h1>
  <p>Setup for: ${answers.framework}</p>
  <button id="show-modal">Test Modal</button>
  
  <div id="builder-container" style="height: 500px; margin-top:20px;"></div>

  <script>
    PeyekCore.peyek.init();
    
    document.getElementById('show-modal').addEventListener('click', () => {
        PeyekCore.Modal.show({ title: 'Success!', content: 'PEYEK CLI worked perfectly.' });
    });

    const builder = new PeyekUIBuilder.UIBuilder('builder-container');
    builder.render();
  </script>
</body>
</html>
    `;

        fs.writeFileSync(path.join(projectPath, 'index.html'), htmlTemplate.trim());

        const packageJson = {
            name: answers.projectName,
            version: "1.0.0",
            description: "A P.E.Y.E.K integrated app",
            scripts: {
                "start": "npx http-server ."
            }
        };

        fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

        console.log(chalk.green('\n✅ Project created successfully!'));
        console.log(`\nRun the following commands to get started:`);
        console.log(chalk.cyan(`  cd ${answers.projectName}`));
        console.log(chalk.cyan(`  npm start\n`));

    } catch (error) {
        console.error(chalk.red('\nFailed to create project:'), error);
    }
}

run();
