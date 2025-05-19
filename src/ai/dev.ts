import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-tasks.ts';
import '@/ai/flows/rank-tasks.ts';