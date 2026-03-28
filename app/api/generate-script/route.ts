import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(request: Request) {
  try {
    const { personality, trackTitle, trackArtist, trackRiddim, trackContext, dropInstruction } = await request.json();

    const prompt = `${personality}

You are generating a DJ drop for Urban Culture Vibez Radio.

Track: "${trackTitle}" by ${trackArtist}${trackRiddim ? `\nRiddim: ${trackRiddim}` : ''}${trackContext ? `\nContext: ${trackContext}` : ''}

Task: ${dropInstruction}

Rules:
- Write ONLY the spoken words — no stage directions, no asterisks, no descriptions
- Sound completely natural and in character
- Use authentic language true to your personality
- 60/40 patois to English — authentic Caribbean radio voice
- Make it feel live and real, not scripted`;

    const message = await client.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    });

    const script = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    return NextResponse.json({ script });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}