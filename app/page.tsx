'use client';
import { useState } from 'react';

const DJS = [
  {
    id: 'nzinga',
    name: 'Nzinga the Queen',
    origin: 'Kingston Born · Brixton Raised',
    bio: 'Black British, outspoken, hype energy. Speaks with a Brixton-Kingston accent. Deeply knowledgeable about Reggae and Dancehall, full of stories.',
    voiceId: 'WxkbdVFkSXA4ctPZKdR3',
    personality: `You are Nzinga the Queen, a DJ on Urban Culture Vibez Radio. Born in Kingston Jamaica and raised in Brixton, London. Young, outspoken Black British woman with a strong Brixton-Kingston accent and massive energy. Deeply knowledgeable about Reggae and Dancehall — full of stories and cultural references. Speak with authenticity, hype, and passion. Use Jamaican patois mixed with English naturally at a 60/40 ratio so everyone can follow.`
  },
  {
    id: 'empress-rasta',
    name: 'Empress Rasta Emerlene',
    origin: 'Kingston Born · Netherlands Educated',
    bio: 'Very spiritual Rasta woman. Roots is the foundation, Dancehall is the fire. Program Director — carries authority and wisdom.',
    voiceId: 'NDWK0CEum6TKhTuHIi4r',
    personality: `You are Empress Rasta Emerlene, Program Director and DJ on Urban Culture Vibez Radio. Born in Kingston, educated in the Netherlands. Deeply spiritual Rasta woman — roots is the foundation, Dancehall fire runs through your veins. Speak with authority, wisdom, and spiritual depth. Reference Jah, the culture, the movement. Use Jamaican patois mixed with English at a 60/40 ratio.`
  },
  {
    id: 'empress-riddim',
    name: 'Empress Riddim',
    origin: 'Mandeville Born · Toronto Based',
    bio: 'Hype, current, always on the newest riddims. Represents Toronto. Limited to 3 new riddims per show — ongoing war with Denzel.',
    voiceId: 'PNqcGgGze4KjhngBKj8u',
    personality: `You are Empress Riddim, DJ on Urban Culture Vibez Radio. Born in Mandeville Jamaica, now hailing from Toronto — largest Yard population outside Jamaica. Hype, current, always on the newest riddims. The station manager has limited you to no more than 3 new riddims per show because of your rivalry with Denzel. Toronto pride runs deep. Use Jamaican patois mixed with English at a 60/40 ratio.`
  },
  {
    id: 'denzel',
    name: 'Denzel',
    origin: 'Authentic Yardie · Deep Roots',
    bio: 'Authentic gangsta vibe, deep voice, gyalist energy. Knows the veterans and the business. Feuding with Empress Riddim over new riddims.',
    voiceId: 'dhwafD61uVd8h85wAZSE',
    personality: `You are Denzel, DJ on Urban Culture Vibez Radio. Authentic yardie, deep commanding voice, gyalist and ladies man energy. You know the veteran artists, the business, the history. You play new riddims AND classics — that is YOUR lane. You are in an ongoing feud with Empress Riddim who keeps playing new riddims on her show. Use Jamaican patois mixed with English at a 60/40 ratio.`
  }
];

const DROP_TYPES = [
  { id: 'intro', label: 'Intro Drop' },
  { id: 'outro', label: 'Outro Segue' },
  { id: 'hype', label: 'Hype Call' }
];

export default function Home() {
  const [selectedDJ, setSelectedDJ] = useState<string>('');
  const [dropType, setDropType] = useState('intro');
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackRiddim, setTrackRiddim] = useState('');
  const [trackContext, setTrackContext] = useState('');
  const [script, setScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);

  const dj = DJS.find(d => d.id === selectedDJ);

  async function generateScript() {
    if (!selectedDJ) return setError('Please select a DJ.');
    if (!trackTitle || !trackArtist) return setError('Please enter track title and artist.');
    setError('');
    setLoadingScript(true);
    setStatus('Writing script with Riddim Intelligence...');
    setScript('');
    setAudioUrl('');

    const dropInstructions: Record<string, string> = {
      intro: 'Write a DJ intro drop to play BEFORE the track. Hype the listener, introduce the track and artist. Keep it 20-35 seconds when spoken.',
      outro: 'Write a DJ outro to play AFTER the track. React to what just played, bridge into what is coming. Keep it 15-25 seconds when spoken.',
      hype: 'Write a short hype call — pure energy, big up the track and artist. Keep it 10-20 seconds when spoken.'
    };

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: dj?.personality,
          trackTitle,
          trackArtist,
          trackRiddim,
          trackContext,
          dropInstruction: dropInstructions[dropType]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Script generation failed');
      setScript(data.script);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }

    setLoadingScript(false);
    setStatus('');
  }

  async function generateVoice() {
    if (!script) return setError('Generate a script first.');
    if (!dj) return;
    setError('');
    setLoadingVoice(true);
    setStatus('Generating voice with ElevenLabs...');

    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, voiceId: dj.voiceId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Voice generation failed');
      }

      const blob = await response.blob();
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }

    setLoadingVoice(false);
    setStatus('');
  }

  function downloadAudio() {
    if (!audioBlob || !dj) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dj.name.replace(/\s+/g, '-').toLowerCase()}-drop.mp3`;
    a.click();
  }

  return (
    <main style={{ background: '#0A0A0A', minHeight: '100vh', color: '#E8E0D0', fontFamily: 'sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#D4A017', marginBottom: 8 }}>URBAN CULTURE VIBEZ RADIO</div>
          <h1 style={{ fontSize: 56, fontWeight: 900, color: '#F0C040', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 8 }}>RIDDIM INTELLIGENCE</h1>
          <div style={{ fontSize: 12, color: '#7A7060', letterSpacing: '0.2em' }}>// DJ DROP GENERATOR //</div>
        </div>

        <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#D4A017', marginBottom: 16, textTransform: 'uppercase' as const }}>Select Your DJ</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {DJS.map(d => (
            <div key={d.id} onClick={() => setSelectedDJ(d.id)}
              style={{ background: selectedDJ === d.id ? 'rgba(212,160,23,0.1)' : '#1A1A1A', border: `1px solid ${selectedDJ === d.id ? '#D4A017' : 'rgba(212,160,23,0.25)'}`, borderRadius: 4, padding: 20, cursor: 'pointer' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#F0C040', marginBottom: 4 }}>{d.name}</div>
              <div style={{ fontSize: 10, color: '#7A7060', letterSpacing: '0.1em', marginBottom: 8 }}>{d.origin}</div>
              <div style={{ fontSize: 12, color: 'rgba(232,224,208,0.7)', lineHeight: 1.6 }}>{d.bio}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1A1A1A', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#D4A017', marginBottom: 16, textTransform: 'uppercase' as const }}>Track Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#7A7060', letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' as const }}>Track Title</div>
              <input value={trackTitle} onChange={e => setTrackTitle(e.target.value)} placeholder="e.g. Redemption Song"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 3, color: '#E8E0D0', padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#7A7060', letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' as const }}>Artist</div>
              <input value={trackArtist} onChange={e => setTrackArtist(e.target.value)} placeholder="e.g. Bob Marley"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 3, color: '#E8E0D0', padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#7A7060', letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' as const }}>Riddim (optional)</div>
              <input value={trackRiddim} onChange={e => setTrackRiddim(e.target.value)} placeholder="e.g. Diwali Riddim"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 3, color: '#E8E0D0', padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#7A7060', letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' as const }}>Extra Context (optional)</div>
              <input value={trackContext} onChange={e => setTrackContext(e.target.value)} placeholder="e.g. 1983 classic, pure roots"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 3, color: '#E8E0D0', padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#7A7060', letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' as const }}>Drop Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {DROP_TYPES.map(t => (
              <div key={t.id} onClick={() => setDropType(t.id)}
                style={{ background: dropType === t.id ? 'rgba(212,160,23,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${dropType === t.id ? '#D4A017' : 'rgba(212,160,23,0.2)'}`, borderRadius: 3, padding: '10px 8px', cursor: 'pointer', textAlign: 'center' as const, fontSize: 11, color: dropType === t.id ? '#F0C040' : '#7A7060', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {error && <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 3, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#E74C3C' }}>{error}</div>}
        {status && <div style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 3, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#D4A017' }}>{status}</div>}

        <button onClick={generateScript} disabled={loadingScript}
          style={{ width: '100%', background: '#D4A017', color: '#0A0A0A', border: 'none', borderRadius: 3, fontSize: 22, fontWeight: 900, letterSpacing: '0.1em', padding: 18, cursor: loadingScript ? 'not-allowed' : 'pointer', opacity: loadingScript ? 0.6 : 1, marginBottom: 24 }}>
          {loadingScript ? 'GENERATING...' : 'GENERATE DJ DROP'}
        </button>

        {script && (
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#D4A017', marginBottom: 16, textTransform: 'uppercase' as const }}>Generated Script</div>
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,160,23,0.15)', borderRadius: 3, padding: 20, fontSize: 15, lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' as const }}>{script}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
              <button onClick={generateScript}
                style={{ background: 'transparent', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 3, color: '#D4A017', fontSize: 11, letterSpacing: '0.1em', padding: '10px 20px', cursor: 'pointer', textTransform: 'uppercase' as const }}>
                Regenerate
              </button>
              <button onClick={generateVoice} disabled={loadingVoice}
                style={{ background: '#1A4D2E', border: '1px solid #2A7A4A', borderRadius: 3, color: '#90EE90', fontSize: 11, letterSpacing: '0.1em', padding: '10px 20px', cursor: loadingVoice ? 'not-allowed' : 'pointer', opacity: loadingVoice ? 0.6 : 1, textTransform: 'uppercase' as const }}>
                {loadingVoice ? 'Generating Voice...' : 'Generate Voice'}
              </button>
            </div>

            {audioUrl && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#D4A017', marginBottom: 12, textTransform: 'uppercase' as const }}>Audio Output</div>
                <audio controls src={audioUrl} style={{ width: '100%', marginBottom: 12 }} />
                <button onClick={downloadAudio}
                  style={{ background: '#1A4D2E', border: '1px solid #2A7A4A', borderRadius: 3, color: '#90EE90', fontSize: 11, letterSpacing: '0.1em', padding: '10px 20px', cursor: 'pointer', textTransform: 'uppercase' as const }}>
                  Download Audio
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center' as const, fontSize: 10, color: '#7A7060', letterSpacing: '0.2em', marginTop: 40 }}>
          RIDDIM INTELLIGENCE · URBAN CULTURE VIBEZ RADIO
        </div>
      </div>
    </main>
  );
}