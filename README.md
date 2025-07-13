# cpp-to-java-converter




https://github.com/user-attachments/assets/f2e9e44a-583b-4ed9-93f0-fbaf28e5ccc7


A Node.js tool that converts C++ source files to Java using the Gemini API (Google Generative AI). The project is structured for easy extension to other language pairs in the future.

## Features
- **Batch conversion:** Recursively finds all `.cpp` files in the input directory and converts them to `.java` files, preserving folder structure.
- **AI-powered:** Uses Gemini API for high-quality code translation.
- **Configurable paths:** Input and output directories can be set via environment variables.
- **Logging:** All conversion results (success/failure) are logged to `conversion.log`.
- **Rate limiting:** Built-in delay to avoid exceeding Gemini API free tier limits.

## Requirements
- Node.js (v14 or higher recommended)
- Gemini API key (see [Gemini documentation](https://ai.google.dev/gemini-api/docs/get-started))

## Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd cpp-to-java-converter
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the project root with your Gemini API key:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   # Optional: customize input/output directories
   CPP_REPO_PATH=./cpp-files
   JAVA_OUTPUT_PATH=./java-output
   ```

## Usage
1. Place your C++ `.cpp` files in the directory specified by `CPP_REPO_PATH` (default: `./cpp-files`).
2. Run the converter:
   ```bash
   node index.js
   ```
3. Converted `.java` files will appear in the directory specified by `JAVA_OUTPUT_PATH` (default: `./java-output`).
4. Check `conversion.log` for a summary of conversions (successes and failures).

## Environment Variables
- `GEMINI_API_KEY` (required): Your Gemini API key.
- `CPP_REPO_PATH` (optional): Path to the directory containing C++ files. Default: `./cpp-files`
- `JAVA_OUTPUT_PATH` (optional): Path to the directory for converted Java files. Default: `./java-output`

## Logging
- All conversion attempts are logged in `conversion.log` with timestamps and file paths.

## Rate Limiting & Gemini API Usage
- The script includes a delay between requests to avoid exceeding Gemini API free tier limits.
- **Important:** The Gemini API has a limit of **500 requests per day**. Plan your conversions accordingly.

## .gitignore
- `.env` and `node_modules` are ignored by default. Do not commit your API keys.

## Extending to Other Languages
- The current implementation is for C++ to Java, but the structure allows for easy generalization to other language pairs in the future. You can adapt the prompt and file handling logic as needed.

## License
MIT 
