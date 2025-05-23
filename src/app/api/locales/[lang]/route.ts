// src/app/api/locales/[lang]/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: { lang: string } }
) {
  const lang = params.lang;
  try {
    // Construct the path to the locale file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'locales', `${lang}.i18n.json`);
    
    // Read the file contents
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Parse the JSON
    const messages = JSON.parse(fileContents);
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error(`Failed to load locale ${lang}:`, error);
    // Return a 404 if the file is not found or another error occurs
    return NextResponse.json({ error: `Locale ${lang} not found` }, { status: 404 });
  }
}
