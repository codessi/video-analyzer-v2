import OpenAI from 'openai';
import fs from 'fs';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3, // Add retry logic
  timeout: 30000, // 30 second timeout
});

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function transcribeAudio(audioFilePath: string): Promise<string> {
  let retryCount = 0;
  const maxRetries = 3;
  const baseDelay = 1000; // Start with 1 second delay

  while (retryCount < maxRetries) {
    try {
      // Verify file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found at path: ${audioFilePath}`);
      }

      // Verify file is not empty
      const stats = fs.statSync(audioFilePath);
      if (stats.size === 0) {
        throw new Error('Audio file is empty');
      }

      // Verify file is readable
      try {
        fs.accessSync(audioFilePath, fs.constants.R_OK);
      } catch (error) {
        throw new Error('Audio file is not readable');
      }

      console.log(`Attempt ${retryCount + 1}: Starting transcription of file ${audioFilePath}`);
      
      // Create a new file stream for each attempt
      const audioFile = fs.createReadStream(audioFilePath);
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "text",
      });

      if (!transcription.text) {
        throw new Error('No transcription text received from Whisper API');
      }

      console.log('Transcription successful');
      return transcription.text;
    } catch (error) {
      retryCount++;
      console.error(`Attempt ${retryCount} failed:`, error);

      if (retryCount === maxRetries) {
        console.error('All retry attempts failed');
        if (error instanceof Error) {
          throw new Error(`Failed to transcribe audio after ${maxRetries} attempts: ${error.message}`);
        }
        throw new Error('Failed to transcribe audio');
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, retryCount) * (0.5 + Math.random());
      console.log(`Waiting ${Math.round(delay)}ms before retry...`);
      await wait(delay);
    }
  }

  throw new Error('Failed to transcribe audio after all retries');
} 