import YTDlpWrap from 'yt-dlp-wrap';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize yt-dlp with debug logging
const ytDlp = new YTDlpWrap();

// Helper function to check if yt-dlp is installed and working
async function checkYtDlp(): Promise<void> {
  try {
    const version = await ytDlp.getVersion();
    console.log('yt-dlp version:', version);
  } catch (error) {
    console.error('yt-dlp check failed:', error);
    throw new Error('yt-dlp is not properly installed or accessible');
  }
}

export async function extractAudio(url: string): Promise<string> {
  // Check yt-dlp first
  await checkYtDlp();

  const tempDir = os.tmpdir();
  const outputPath = path.join(tempDir, `${Date.now()}.mp3`);
  console.log('Output path:', outputPath);

  try {
    // Validate URL format
    if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
      throw new Error('Invalid YouTube URL format');
    }

    console.log('Starting audio extraction for URL:', url);
    
    // Create a promise that resolves when the download is complete
    const downloadPromise = new Promise<void>((resolve, reject) => {
      const process = ytDlp.exec([
        url,
        '-x', // Extract audio
        '--audio-format', 'mp3',
        '--audio-quality', '0', // Best quality
        '-o', outputPath,
        '--no-playlist', // Don't download playlists
        '--no-warnings', // Suppress warnings
        '--verbose', // Add verbose output
      ]);

      // Handle process events
      process.on('progress', (progress: any) => {
        console.log('Download progress:', progress);
      });

      process.on('error', (error: Error) => {
        console.error('Download error:', error);
        reject(error);
      });

      process.on('close', (code: number) => {
        if (code === 0) {
          console.log('Download completed successfully');
          resolve();
        } else {
          reject(new Error(`Download failed with code ${code}`));
        }
      });
    });

    // Wait for the download to complete
    await downloadPromise;

    // Add a small delay to ensure file system operations are complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify the file was created
    if (!fs.existsSync(outputPath)) {
      console.error('File not found at path:', outputPath);
      throw new Error('Audio file was not created successfully');
    }

    // Verify the file is not empty
    const stats = fs.statSync(outputPath);
    console.log('File stats:', stats);
    
    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }

    return outputPath;
  } catch (error) {
    // Clean up the file if it exists but there was an error
    if (fs.existsSync(outputPath)) {
      console.log('Cleaning up failed download at:', outputPath);
      fs.unlinkSync(outputPath);
    }
    
    console.error('Error extracting audio:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract audio: ${error.message}`);
    }
    throw new Error('Failed to extract audio from video');
  }
}

export function cleanupAudio(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      console.log('Cleaning up audio file:', filePath);
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up audio file:', error);
  }
} 