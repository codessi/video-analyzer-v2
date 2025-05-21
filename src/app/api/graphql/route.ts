import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { extractAudio, cleanupAudio } from '@/utils/extractAudio';
import { transcribeAudio } from '@/utils/transcribe';

// Define the GraphQL schema
const typeDefs = gql`
  type Analysis {
    transcription: String
    sentiment: String
  }

  type Query {
    analyzeVideo(url: String!): Analysis
  }
`;

// Resolvers
const resolvers = {
  Query: {
    analyzeVideo: async (_: any, { url }: { url: string }) => {
      let audioFilePath: string | null = null;
      
      try {
        // Extract audio from video
        audioFilePath = await extractAudio(url);
        
        // Transcribe the audio
        const transcription = await transcribeAudio(audioFilePath);
        
        // TODO: Implement sentiment analysis
        const sentiment = "Positive"; // Placeholder for now
        
        return {
          transcription,
          sentiment,
        };
      } catch (error) {
        console.error('Error analyzing video:', error);
        throw new Error('Failed to analyze video');
      } finally {
        // Clean up the temporary audio file
        if (audioFilePath) {
          cleanupAudio(audioFilePath);
        }
      }
    },
  },
};

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create and export the handler
const handler = startServerAndCreateNextHandler(server);
export { handler as GET, handler as POST }; 