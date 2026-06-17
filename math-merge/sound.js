// sound.js - Web Audio API Synthesizer for Retro Sounds
class SoundController {
  constructor() {
    this.ctx = null;
    this.bgmInterval = null;
    this.isMuted = false;
  }
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playSelect() {
    if (this.isMuted) return;
    this.init();
    
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playAttack() {
    if (this.isMuted) return;
    this.init();
    
    // Noise buffer for "slash" sound
    let bufferSize = this.ctx.sampleRate * 0.15;
    let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    let data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    let noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    let filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);
    
    let gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
    
    // Triangle oscillator for metallic hit sound
    let osc = this.ctx.createOscillator();
    let oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    oscGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playWin() {
    if (this.isMuted) return;
    this.init();
    
    // Energetic ascending arpeggio (C5 -> E5 -> G5 -> C6)
    let notes = [523.25, 659.25, 783.99, 1046.50];
    let now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  playLose() {
    if (this.isMuted) return;
    this.init();
    
    let now = this.ctx.currentTime;
    let freqs = [180, 175];
    freqs.forEach(freq => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.5, now + 0.5);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  playUpgrade() {
    if (this.isMuted) return;
    this.init();
    
    let now = this.ctx.currentTime;
    let notes = [587.33, 880.00, 1174.66]; // D5 -> A5 -> D6 coin-like sound
    notes.forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  playBgm() {
    if (this.isMuted) return;
    this.init();
    if (this.bgmInterval) return;

    // Simple 8-bit chip-tune style BGM loop
    let tempo = 120;
    let step = 60 / tempo / 2; // 8th note duration
    // Chord progression: Am -> F -> C -> G
    let chords = [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [261.63, 329.63, 392.00], // C
      [196.00, 246.94, 293.66]  // G
    ];
    let chordIdx = 0;
    let stepIdx = 0;

    const playNote = (freq, time, dur, vol = 0.02) => {
      if (!this.ctx) return;
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur - 0.01);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    };

    let nextNoteTime = this.ctx.currentTime;
    const scheduler = () => {
      if (this.isMuted) return;
      while (nextNoteTime < this.ctx.currentTime + 0.1) {
        let chord = chords[chordIdx];
        
        // Bass line
        if (stepIdx % 4 === 0) {
          playNote(chord[0] / 2, nextNoteTime, step * 2, 0.03);
        }
        
        // Melody arpeggio
        let notePattern = [0, 1, 2, 1, 0, 2, 1, 2];
        let noteVal = chord[notePattern[stepIdx % notePattern.length]];
        // Add some variation on melody
        if (stepIdx % 2 === 0) {
          playNote(noteVal, nextNoteTime, step * 0.9, 0.015);
        }
        
        nextNoteTime += step;
        stepIdx++;
        if (stepIdx >= 8) {
          stepIdx = 0;
          chordIdx = (chordIdx + 1) % chords.length;
        }
      }
    };

    this.bgmInterval = setInterval(scheduler, 50);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm();
    } else {
      this.playBgm();
    }
    return this.isMuted;
  }
}

// Global instance
const sounds = new SoundController();
window.sounds = sounds;
