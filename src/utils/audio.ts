import * as Tone from 'tone'

let audioInitialized = false
let backgroundSynth: Tone.PolySynth | null = null
let backgroundLoop: Tone.Loop | null = null

export async function initializeAudio() {
  if (audioInitialized) return
  
  await Tone.start()
  audioInitialized = true
  
  // Create background synth
  backgroundSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
  }).toDestination()
  
  // Background music loop - cyberpunk beat
  backgroundLoop = new Tone.Loop((time) => {
    const notes = ['C2', 'C2', 'D#2', 'C2', 'D#2', 'C2']
    const note = notes[Math.floor(Math.random() * notes.length)]
    backgroundSynth?.triggerAttackRelease(note, '8n', time)
  }, '0.5')
  
  backgroundLoop.start(0)
  Tone.Transport.bpm.value = 120
  Tone.Transport.start()
}

export function stopAudio() {
  if (backgroundLoop) {
    backgroundLoop.stop()
    backgroundLoop.dispose()
    backgroundLoop = null
  }
  
  if (backgroundSynth) {
    backgroundSynth.dispose()
    backgroundSynth = null
  }
  
  Tone.Transport.stop()
  audioInitialized = false
}

export async function playHackSound() {
  await Tone.start()
  
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.05 }
  }).toDestination()
  
  synth.triggerAttackRelease('G4', '0.1')
  
  setTimeout(() => synth.dispose(), 200)
}

export async function playHitSound() {
  await Tone.start()
  
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0 }
  }).toDestination()
  
  synth.triggerAttackRelease('C2', '0.05')
  
  setTimeout(() => synth.dispose(), 100)
}

export async function playDeathSound() {
  await Tone.start()
  
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0 }
  }).toDestination()
  
  synth.triggerAttackRelease('C1', '0.3')
  
  setTimeout(() => synth.dispose(), 400)
}

export async function playDodgeSound() {
  await Tone.start()
  
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0, release: 0.05 }
  }).toDestination()
  
  synth.triggerAttackRelease('E4', '0.1')
  
  setTimeout(() => synth.dispose(), 150)
}
