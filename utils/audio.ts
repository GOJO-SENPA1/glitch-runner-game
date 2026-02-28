// Web Audio API for sound synthesis
let audioContext: AudioContext | null = null;
let ambienceStarted = false;

export async function initializeAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  }

  if (!ambienceStarted) {
    ambienceStarted = true;
    playAmbienceLoop();
  }
}

export function stopAudio() {
  ambienceStarted = false;
}

// For backwards compatibility
export async function initAudio() {
  return initializeAudio();
}

export function stopAllSounds() {
  stopAudio();
}

function playAmbienceLoop() {
  if (!audioContext || !ambienceStarted) return;

  const playDroneNote = (frequency: number, duration: number) => {
    const osc = audioContext!.createOscillator();
    const gain = audioContext!.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.02, audioContext!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioContext!.destination);

    osc.start(audioContext!.currentTime);
    osc.stop(audioContext!.currentTime + duration);
  };

  const notes = [65.41, 130.81, 174.61, 293.66]; // C2, C3, F3, D4
  let index = 0;

  const playNext = () => {
    if (!ambienceStarted) return;
    playDroneNote(notes[index], 1);
    index = (index + 1) % notes.length;
    setTimeout(playNext, 1000);
  };

  playNext();
}

export function playDodgeSound() {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);

  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.1);
}

export function playHitSound() {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.15);
}

export function playHackSound() {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, audioContext.currentTime);
  osc.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.05);

  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.1);
}

// Compatibility aliases
export function playBackgroundBeat() {
  playHitSound();
}

export function playJumpSound() {
  playDodgeSound();
}

export function playDeathSound() {
  playHitSound();
}
