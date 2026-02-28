import * as Tone from 'tone';

let synthBass: Tone.Synth | null = null;
let hihat: Tone.MetalSynth | null = null;
let dub: Tone.Synth | null = null;

export async function initAudio() {
  await Tone.start();
  
  // Initialize drum synth for beats
  hihat = new Tone.MetalSynth({
    harmonics: [8, 12],
    resonance: 800,
    volume: -8,
  }).toDestination();

  // Bass synth
  synthBass = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
    volume: -6,
  }).toDestination();

  // Dub synth for effects
  dub = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.1,
      release: 0.2,
    },
    volume: -12,
  }).toDestination();
}

export function playBackgroundBeat() {
  if (!synthBass || !hihat) return;
  
  const now = Tone.now();
  
  // Bass line pattern (kicks)
  synthBass.triggerAttackRelease('C1', '8n', now);
  synthBass.triggerAttackRelease('C1', '8n', now + 0.5);
  synthBass.triggerAttackRelease('A0', '8n', now + 1);
  synthBass.triggerAttackRelease('C1', '8n', now + 1.5);
  
  // Hi-hat pattern
  hihat.triggerAttackRelease('16n', now + 0.25);
  hihat.triggerAttackRelease('16n', now + 0.75);
  hihat.triggerAttackRelease('16n', now + 1.25);
  hihat.triggerAttackRelease('16n', now + 1.75);
}

export function playHackSound() {
  if (!dub) return;
  const now = Tone.now();
  dub.triggerAttackRelease('G4', '16n', now);
  dub.triggerAttackRelease('D5', '32n', now + 0.05);
}

export function playJumpSound() {
  if (!dub) return;
  const now = Tone.now();
  dub.triggerAttackRelease('C5', '8n', now);
  dub.triggerAttackRelease('E5', '16n', now + 0.1);
}

export function playDeathSound() {
  if (!synthBass || !dub) return;
  const now = Tone.now();
  
  synthBass.triggerAttackRelease('C1', '2n', now);
  dub.triggerAttackRelease('G1', '1n', now);
  dub.triggerAttackRelease('D1', '1n', now + 0.2);
}

export function stopAllSounds() {
  if (synthBass) synthBass.triggerRelease();
  if (dub) dub.triggerRelease();
  if (hihat) hihat.triggerRelease();
}
