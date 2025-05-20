
'use server';

/**
 * @fileOverview Ranks cards on a kanban board according to description and deadline.
 *
 * - rankCards - A function that handles the card ranking process.
 * - RankCardsInput - The input type for the rankCards function.
 * - RankCardsOutput - The return type for the rankCards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RankCardsInputSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the card.'),
      description: z.string().describe('A detailed description of the card.'),
      deadline: z.string().optional().describe('The deadline of the card in ISO 8601 format (YYYY-MM-DD).'),
    })
  ).describe('An array of cards to be ranked.'),
});
export type RankCardsInput = z.infer<typeof RankCardsInputSchema>;

const RankCardsOutputSchema = z.array(
  z.object({
    id: z.string().describe('The unique identifier of the card.'),
    rank: z.number().describe('The rank of the card, with lower numbers indicating higher priority.'),
    reason: z.string().describe('The reason for the assigned rank.'),
  })
);
export type RankCardsOutput = z.infer<typeof RankCardsOutputSchema>;

export async function rankCards(input: RankCardsInput): Promise<RankCardsOutput> {
  return rankCardsFlow(input);
}

const rankCardsPrompt = ai.definePrompt({
  name: 'rankCardsPrompt',
  input: {schema: RankCardsInputSchema},
  output: {schema: RankCardsOutputSchema},
  prompt: `You are an AI card ranker. You will be provided with a list of cards, their descriptions, and their deadlines.

  Rank the cards based on their importance and urgency. Cards with earlier deadlines and more detailed descriptions should be ranked higher.

  Here are the cards:
  {{#each cards}}
  - Card ID: {{this.id}}
    Description: {{this.description}}
    Deadline: {{this.deadline}}
  {{/each}}

  Return a JSON array of cards with their ranks and reasons for the assigned rank.
  The cards in the output MUST have the same card IDs as the input cards.
  The rank should be a number, with lower numbers indicating higher priority.
  The reason should be a short explanation of why the card was ranked as such.
  `,
});

const rankCardsFlow = ai.defineFlow(
  {
    name: 'rankCardsFlow',
    inputSchema: RankCardsInputSchema,
    outputSchema: RankCardsOutputSchema,
  },
  async input => {
    const {output} = await rankCardsPrompt(input);
    return output!;
  }
);
