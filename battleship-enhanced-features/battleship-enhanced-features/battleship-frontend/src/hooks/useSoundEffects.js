import { useRef, useCallback } from 'react';

const useSoundEffects = () => {
  const audioContextRef = useRef(null);
  const soundEnabledRef = useRef(true);

  // สร้าง AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // สร้างเสียงด้วย Web Audio API
  const createTone = useCallback((frequency, duration, type = 'sine') => {
    if (!soundEnabledRef.current) return;

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
  }, [getAudioContext]);

  // เสียงเมื่อโดนเป้า (Hit)
  const playHitSound = useCallback(() => {
    createTone(800, 0.2, 'square');
    setTimeout(() => createTone(600, 0.15, 'square'), 100);
  }, [createTone]);

  // เสียงเมื่อพลาด (Miss)
  const playMissSound = useCallback(() => {
    createTone(200, 0.3, 'sine');
  }, [createTone]);

  // เสียงเมื่อชนะ (Win)
  const playWinSound = useCallback(() => {
    const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
    notes.forEach((note, index) => {
      setTimeout(() => createTone(note, 0.5, 'triangle'), index * 200);
    });
  }, [createTone]);

  // เสียงเมื่อแพ้ (Lose)
  const playLoseSound = useCallback(() => {
    createTone(300, 0.5, 'sawtooth');
    setTimeout(() => createTone(250, 0.5, 'sawtooth'), 300);
    setTimeout(() => createTone(200, 0.8, 'sawtooth'), 600);
  }, [createTone]);

  // เสียงเมื่อเริ่มเกมใหม่ (New Game)
  const playNewGameSound = useCallback(() => {
    createTone(440, 0.2, 'triangle');
    setTimeout(() => createTone(554, 0.2, 'triangle'), 150);
    setTimeout(() => createTone(659, 0.3, 'triangle'), 300);
  }, [createTone]);

  // เสียงเมื่อเรือจม (Ship Sunk)
  const playShipSunkSound = useCallback(() => {
    createTone(400, 0.3, 'square');
    setTimeout(() => createTone(350, 0.3, 'square'), 200);
    setTimeout(() => createTone(300, 0.5, 'square'), 400);
  }, [createTone]);

  // เสียงเมื่อ AI ยิง
  const playAIShotSound = useCallback(() => {
    createTone(150, 0.1, 'square');
    setTimeout(() => createTone(180, 0.1, 'square'), 50);
    setTimeout(() => createTone(200, 0.1, 'square'), 100);
  }, [createTone]);

  // เปิด/ปิดเสียง
  const toggleSound = useCallback((enabled) => {
    soundEnabledRef.current = enabled;
  }, []);

  // ตรวจสอบว่าเสียงเปิดอยู่หรือไม่
  const isSoundEnabled = useCallback(() => {
    return soundEnabledRef.current;
  }, []);

  return {
    playHitSound,
    playMissSound,
    playWinSound,
    playLoseSound,
    playNewGameSound,
    playShipSunkSound,
    playAIShotSound,
    toggleSound,
    isSoundEnabled
  };
};

export default useSoundEffects;

