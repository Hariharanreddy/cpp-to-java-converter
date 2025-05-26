import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cppRepoPath, javaOutputPath } from './config.js';

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const LOG_FILE = './conversion.log';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds
const RATE_LIMIT_DELAY_MS = 3500; // Assume 30 req/min for free tier (~2 sec per request)

function logToFile(message) {
  fs.appendFileSync(LOG_FILE, message + "\n");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function convertCppToJava(cppCode) {
  const prompt = `
Convert the following C++ DSA code into equivalent Java code with proper class and method structure.

- Preserve the original logic and structure as much as possible.
- Add necessary comments and notes in Java code (use Java comment syntax).
- Provide only raw Java code without any markdown formatting, explanations, or additional text.
- The output should be ready to compile and run directly as a Java program.
- Don't provide the response in code block of markdown, just give it as a normal string.

C++ Code:
\`\`\`cpp
${cppCode}
\`\`\`

Java equivalent:
`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(response.text());
      return response.text();
    } catch (error) {
      console.warn(`Retry ${attempt} failed: ${error.message}`);
      if (attempt === MAX_RETRIES) {
        console.error('Max retries reached. Skipping file.');
        return null;
      }
      await sleep(RETRY_DELAY_MS);
    }
  }
}

async function getAllCppFilesRecursive(dir, baseDir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllCppFilesRecursive(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.cpp')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

async function processFiles() {
  const startTime = new Date();
  logToFile(`\n--- Conversion started at ${startTime.toISOString()} ---`);

  const cppFiles = await getAllCppFilesRecursive(cppRepoPath, cppRepoPath);

  for (const { fullPath, relativePath } of cppFiles) {
    const cppCode = fs.readFileSync(fullPath, 'utf-8');
    const javaCode = await convertCppToJava(cppCode);

    if (javaCode) {
      const javaRelativePath = relativePath.replace(/\.cpp$/i, '.java');
      const javaFullPath = path.join(javaOutputPath, javaRelativePath);

      fs.mkdirSync(path.dirname(javaFullPath), { recursive: true });
      fs.writeFileSync(javaFullPath, javaCode, 'utf-8');

      const successMsg = `✅ Converted: ${relativePath} → ${javaRelativePath}`;
      console.log(successMsg);
      logToFile(successMsg);
    } else {
      const failMsg = `❌ Failed: ${relativePath}`;
      console.log(failMsg);
      logToFile(failMsg);
    }

    await sleep(RATE_LIMIT_DELAY_MS); // Apply rate limiting
  }

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  const doneMsg = `\n🎉 Conversion complete in ${duration.toFixed(2)} seconds`;
  console.log(doneMsg);
  logToFile(doneMsg);
  logToFile(`--- Conversion ended at ${endTime.toISOString()} ---\n`);
}

processFiles();
