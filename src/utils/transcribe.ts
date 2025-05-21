import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function transcribeAudio(audioFilePath: string): Promise<string> {
  let retryCount = 0;
  const maxRetries = 3;
  const baseDelay = 1000;

  while (retryCount < maxRetries) {
    try {
      // Verify file exists and is readable
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found at path: ${audioFilePath}`);
      }

      const stats = fs.statSync(audioFilePath);
      if (stats.size === 0) {
        throw new Error('Audio file is empty');
      }

      console.log(`Attempt ${retryCount + 1}: Starting transcription of file ${audioFilePath}`);
      
      // Create form data
      const formData = new FormData();
      
      // Add the file first
      formData.append('file', fs.createReadStream(audioFilePath), {
        filename: 'audio.mp3',
        contentType: 'audio/mpeg',
      });

      // Add other parameters
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'text');

      // Make the API request
      const response = await fetch(WHISPER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          ...formData.getHeaders(), // This is important for node-fetch
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error Response:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }

      const transcription = await response.text();
      
      if (!transcription) {
        throw new Error('No transcription text received from Whisper API');
      }

      console.log('Transcription successful');
      return transcription;
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