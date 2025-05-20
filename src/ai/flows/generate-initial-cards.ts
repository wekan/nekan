
// use server'

/**
 * @fileOverview Generates initial cards for a project board based on a high-level description.
 *
 * - generateInitialCards - A function that generates initial cards for a project board.
 * - GenerateInitialCardsInput - The input type for the generateInitialCards function.
 * - GenerateInitialCardsOutput - The return type for the generateInitialCards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialCardsInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A high-level description of the project.'),
});
export type GenerateInitialCardsInput = z.infer<typeof GenerateInitialCardsInputSchema>;

const GenerateInitialCardsOutputSchema = z.object({
  cards: z
    .array(z.string())
    .describe('A list of initial cards for the project.'),
});
export type GenerateInitialCardsOutput = z.infer<typeof GenerateInitialCardsOutputSchema>;

export async function generateInitialCards(input: GenerateInitialCardsInput): Promise<GenerateInitialCardsOutput> {
  return generateInitialCardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialCardsPrompt',
  input: {schema: GenerateInitialCardsInputSchema},
  output: {schema: GenerateInitialCardsOutputSchema},
  prompt: `You are a project management assistant. You will generate a list of initial cards (or tasks) for a project, based on the project description. The cards should be specific and actionable.

Project Description: {{{projectDescription}}}

Cards:`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
});

const generateInitialCardsFlow = ai.defineFlow(
  {
    name: 'generateInitialCardsFlow',
    inputSchema: GenerateInitialCardsInputSchema,
    outputSchema: GenerateInitialCardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
