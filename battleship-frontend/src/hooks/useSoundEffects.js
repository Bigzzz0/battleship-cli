import { useRef, useCallback, useState } from 'react';

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

  // สร้างเสียงด้วย Web Audio API
  const createTone = useCallback((frequency, duration, type = 'sine') => {
    if (!soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
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
        createTone(800, 0.2, 'square');
        setTimeout(() => createTone(600, 0.15, 'square'), 100);
        break;
      case 'miss':
        createTone(200, 0.3, 'sine');
        break;
      case 'win':
        const winNotes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
        winNotes.forEach((note, index) => {
          setTimeout(() => createTone(note, 0.5, 'triangle'), index * 200);
        });
        break;
      case 'lose':
        createTone(300, 0.5, 'sawtooth');
        setTimeout(() => createTone(250, 0.5, 'sawtooth'), 300);
        setTimeout(() => createTone(200, 0.8, 'sawtooth'), 600);
        break;
      case 'newGame':
        createTone(440, 0.2, 'triangle');
        setTimeout(() => createTone(554, 0.2, 'triangle'), 150);
        setTimeout(() => createTone(659, 0.3, 'triangle'), 300);
        break;
      case 'shipSunk':
        createTone(400, 0.3, 'square');
        setTimeout(() => createTone(350, 0.3, 'square'), 200);
        setTimeout(() => createTone(300, 0.5, 'square'), 400);
        break;
      case 'aiShot':
        createTone(150, 0.1, 'square');
        setTimeout(() => createTone(180, 0.1, 'square'), 50);
        setTimeout(() => createTone(200, 0.1, 'square'), 100);
        break;
      default:
        console.warn('Unknown sound type:', soundType);
    }
  }, [createTone]);

  return {
    playSound,
    soundEnabled,
    setSoundEnabled
  };
};

export default useSoundEffects;

