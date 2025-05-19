// use server'

/**
 * @fileOverview Generates initial tasks for a project board based on a high-level description.
 *
 * - generateInitialTasks - A function that generates initial tasks for a project board.
 * - GenerateInitialTasksInput - The input type for the generateInitialTasks function.
 * - GenerateInitialTasksOutput - The return type for the generateInitialTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialTasksInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A high-level description of the project.'),
});
export type GenerateInitialTasksInput = z.infer<typeof GenerateInitialTasksInputSchema>;

const GenerateInitialTasksOutputSchema = z.object({
  tasks: z
    .array(z.string())
    .describe('A list of initial tasks for the project.'),
});
export type GenerateInitialTasksOutput = z.infer<typeof GenerateInitialTasksOutputSchema>;

export async function generateInitialTasks(input: GenerateInitialTasksInput): Promise<GenerateInitialTasksOutput> {
  return generateInitialTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialTasksPrompt',
  input: {schema: GenerateInitialTasksInputSchema},
  output: {schema: GenerateInitialTasksOutputSchema},
  prompt: `You are a project management assistant. You will generate a list of initial tasks for a project, based on the project description. The tasks should be specific and actionable.

Project Description: {{{projectDescription}}}

Tasks:`, config: {
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

const generateInitialTasksFlow = ai.defineFlow(
  {
    name: 'generateInitialTasksFlow',
    inputSchema: GenerateInitialTasksInputSchema,
    outputSchema: GenerateInitialTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
