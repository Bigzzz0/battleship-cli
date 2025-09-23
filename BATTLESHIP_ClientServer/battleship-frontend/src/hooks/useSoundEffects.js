import { useRef, useCallback, useState } from 'react';

const HIT_SOUND_URL = 'soundeffect/Explosion.mp3';
const VICTORY_SOUND_URL = 'soundeffect/VictoryQ.wav';
const SHIP_SUNK_SOUNDS = [
  'soundeffect/Destroy1.wav',
  'soundeffect/Destroy2.wav',
  'soundeffect/Destroy3.wav',
  'soundeffect/Destroy4.wav',
  'soundeffect/Destroy5.wav'
];
const SHIP_HIT_SOUNDS = [
  'soundeffect/Hit(1).wav',
  'soundeffect/Hit(2).wav',
  'soundeffect/Hit(3).wav',
  'soundeffect/Hit(4).wav',
  'soundeffect/Hit(5).wav',
  'soundeffect/Hit(6).wav',
  'soundeffect/Hit(7).wav',
  'soundeffect/Hit(8).wav',
  'soundeffect/Hit(9).wav',
  'soundeffect/HitEng(1).wav',
  'soundeffect/HitEng(2).wav',
  'soundeffect/HitEng(3).wav',
  'soundeffect/HitEng(4).wav',
  'soundeffect/HitEng(5).wav',
];

const MISS_SOUNDS = [
  'soundeffect/Spash (1).mp3',
  'soundeffect/Spash (2).mp3',
  'soundeffect/Spash (3).mp3'
];


const useSoundEffects = () => {
  const audioContextRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // สร้าง AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // เล่นไฟล์เสียง mp3
  const playAudioFile = useCallback((url) => {
    if (!soundEnabled) return;
    const audio = new window.Audio(url);
    audio.volume = 0.5;
    audio.play();
  }, [soundEnabled]);

  // สร้างเสียงด้วย Web Audio API
  const createTone = useCallback((frequency, duration, type = 'sine', volume = 0.5) => {
    if (!soundEnabled) return;
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }, [getAudioContext, soundEnabled]);

  // Generic play sound function
  const playSound = useCallback((soundType) => {
    switch (soundType) {
      case 'hit':
        playAudioFile(HIT_SOUND_URL);
        const hitRandomIndex = Math.floor(Math.random() * SHIP_HIT_SOUNDS.length);
        playAudioFile(SHIP_HIT_SOUNDS[hitRandomIndex]);
        break;
      case 'miss':
        const missRandomIndex = Math.floor(Math.random() * MISS_SOUNDS.length);
        playAudioFile(MISS_SOUNDS[missRandomIndex]);
        break;
      case 'win':
          setTimeout(() => {
            playAudioFile(VICTORY_SOUND_URL);
              }, 2000); // รอ 2 วินาที
        break;
      case 'lose':
        createTone(80, 0.6, 'square', 0.5);
        setTimeout(() => createTone(60, 0.5, 'sawtooth', 0.4), 300);
        setTimeout(() => createTone(40, 0.8, 'triangle', 0.3), 600);
        break;
      case 'newGame':
        createTone(440, 0.2, 'triangle', 0.3);
        setTimeout(() => createTone(554, 0.2, 'triangle', 0.3), 150);
        setTimeout(() => createTone(659, 0.3, 'triangle', 0.3), 300);
        break;
      case 'shipSunk':
        playAudioFile(HIT_SOUND_URL);
        const sunkRandomIndex = Math.floor(Math.random() * SHIP_SUNK_SOUNDS.length);
        playAudioFile(SHIP_SUNK_SOUNDS[sunkRandomIndex]);
        break;
      case 'aiShot':

        break;
      default:
        console.warn('Unknown sound type:', soundType);
    }
  }, [createTone, playAudioFile]);

  return {
    playSound,
    soundEnabled,
    setSoundEnabled
  };
};

export default useSoundEffects;