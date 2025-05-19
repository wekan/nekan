'use server';

/**
 * @fileOverview Ranks tasks on a kanban board according to description and deadline.
 *
 * - rankTasks - A function that handles the task ranking process.
 * - RankTasksInput - The input type for the rankTasks function.
 * - RankTasksOutput - The return type for the rankTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RankTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the task.'),
      description: z.string().describe('A detailed description of the task.'),
      deadline: z.string().optional().describe('The deadline of the task in ISO 8601 format (YYYY-MM-DD).'),
    })
  ).describe('An array of tasks to be ranked.'),
});
export type RankTasksInput = z.infer<typeof RankTasksInputSchema>;

const RankTasksOutputSchema = z.array(
  z.object({
    id: z.string().describe('The unique identifier of the task.'),
    rank: z.number().describe('The rank of the task, with lower numbers indicating higher priority.'),
    reason: z.string().describe('The reason for the assigned rank.'),
  })
);
export type RankTasksOutput = z.infer<typeof RankTasksOutputSchema>;

export async function rankTasks(input: RankTasksInput): Promise<RankTasksOutput> {
  return rankTasksFlow(input);
}

const rankTasksPrompt = ai.definePrompt({
  name: 'rankTasksPrompt',
  input: {schema: RankTasksInputSchema},
  output: {schema: RankTasksOutputSchema},
  prompt: `You are an AI task ranker. You will be provided with a list of tasks, their descriptions, and their deadlines.

  Rank the tasks based on their importance and urgency. Tasks with earlier deadlines and more detailed descriptions should be ranked higher.

  Here are the tasks:
  {{#each tasks}}
  - Task ID: {{this.id}}
    Description: {{this.description}}
    Deadline: {{this.deadline}}
  {{/each}}

  Return a JSON array of tasks with their ranks and reasons for the assigned rank.
  The tasks in the output MUST have the same task IDs as the input tasks.
  The rank should be a number, with lower numbers indicating higher priority.
  The reason should be a short explanation of why the task was ranked as such.
  `,
});

const rankTasksFlow = ai.defineFlow(
  {
    name: 'rankTasksFlow',
    inputSchema: RankTasksInputSchema,
    outputSchema: RankTasksOutputSchema,
  },
  async input => {
    const {output} = await rankTasksPrompt(input);
    return output!;
  }
);
