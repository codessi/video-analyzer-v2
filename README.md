# Video Analyzer v3

Video Analyzer v3 is a web application that allows you to analyze YouTube videos by extracting their audio, transcribing the speech using OpenAI's Whisper API, and (optionally) performing sentiment analysis on the transcription.

## Features
- **YouTube URL Input:** Enter a YouTube video URL to analyze.
- **Audio Extraction:** Extracts audio from the provided video using `yt-dlp`.
- **Transcription:** Sends the audio to OpenAI Whisper for accurate speech-to-text transcription.
- **Sentiment Analysis:** (Coming soon) Analyzes the sentiment of the transcribed text.
- **Modern UI:** Built with Next.js and React.

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm, yarn, pnpm, or bun
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and accessible in your environment
- OpenAI API key (for Whisper transcription)

### Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd video-analyzer-v3
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set your OpenAI API key in a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
1. Enter a YouTube video URL in the input field.
2. Click **Analyze**.
3. Wait for the app to extract audio, transcribe it, and display the results.
4. View the transcription and sentiment (when available).

## Technologies Used
- Next.js
- React
- Apollo Server (GraphQL API)
- yt-dlp (audio extraction)
- OpenAI Whisper API (transcription)

## License
This project is licensed under the MIT License.
