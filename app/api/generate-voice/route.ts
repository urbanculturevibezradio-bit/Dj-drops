import { NextResponse } from 'next/server';

// Per-voice ElevenLabs settings tuned to each DJ's character
const VOICE_SETTINGS: Record<string, {
      stability: number;
      similarity_boost: number;
      style: number;
      use_speaker_boost: boolean;
      speed: number;
}> = {
      // Nzinga the Queen — Bold, outspoken, hype energy, London-Kingston accent
      'WxkbdVFkSXA4ctPZKdR3': {
              stability: 0.35,
              similarity_boost: 0.80,
              style: 0.25,
              use_speaker_boost: true,
              speed: 1.05
      },
      // Empress Rasta Emerlene — Spiritual, authoritative, wisdom, grounded
      'NDWK0CEum6TKhTuHIi4r': {
              stability: 0.60,
              similarity_boost: 0.80,
              style: 0.15,
              use_speaker_boost: true,
              speed: 0.95
      },
      // Empress Riddim — Hype, current, Toronto energy, newest riddims
      'PNqcGgGze4KjhngBKj8u': {
              stability: 0.30,
              similarity_boost: 0.78,
              style: 0.30,
              use_speaker_boost: true,
              speed: 1.08
      },
      // Denzel — Deep, raspy, commanding, authentic yardie gangsta vibe
      'dhwafD61uVd8h85wAZSE': {
              stability: 0.55,
              similarity_boost: 0.85,
              style: 0.20,
              use_speaker_boost: true,
              speed: 0.92
      }
};

// Fallback defaults matching ElevenLabs Multilingual v2 defaults
const DEFAULT_SETTINGS = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
      speed: 1.0
};

export async function POST(request: Request) {
      try {
              const { script, voiceId } = await request.json();

        // Use per-voice tuned settings, fall back to defaults for unknown voices
        const voiceSettings = VOICE_SETTINGS[voiceId] || DEFAULT_SETTINGS;

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                  method: 'POST',
                  headers: {
                              'Content-Type': 'application/json',
                              'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
                  },
                  body: JSON.stringify({
                              text: script,
                              model_id: 'eleven_multilingual_v2',
                              voice_settings: voiceSettings
                  })
        });

        if (!response.ok) {
                  const error = await response.json();
                  return NextResponse.json(
                      { error: error.detail?.message || 'ElevenLabs error' },
                      { status: 500 }
                            );
        }

        const audioBuffer = await response.arrayBuffer();
              return new NextResponse(audioBuffer, {
                        headers: {
                                    'Content-Type': 'audio/mpeg',
                                    'Content-Length': audioBuffer.byteLength.toString()
                        }
              });

      } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'Unknown error';
              return NextResponse.json({ error: message }, { status: 500 });
      }
}
