import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface VoiceInputProps {
  onResult: (text: string) => void;
  language?: string;
}

let _speechModule: any = null;
let _addListener: any = null;
let _nativeChecked = false;
let _nativeAvailable = false;

function checkNativeAvailability(): boolean {
  if (_nativeChecked) return _nativeAvailable;
  _nativeChecked = true;
  try {
    const mod = require('expo-speech-recognition');
    if (mod?.ExpoSpeechRecognitionModule) {
      _speechModule = mod.ExpoSpeechRecognitionModule;
      _addListener = mod.addSpeechRecognitionListener;
      _nativeAvailable = true;
    }
  } catch {
    _nativeAvailable = false;
  }
  return _nativeAvailable;
}

export function VoiceInput({ onResult, language = 'zh-CN' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedText = useRef('');
  const listenersRef = useRef<Array<() => void>>([]);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showError(msg: string) {
    setErrorMsg(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorMsg(''), 3500);
  }

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }

  function stopPulse() {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }

  const registerNativeListeners = useCallback(() => {
    if (!_addListener || listenersRef.current.length > 0) return;
    try {
      const unsub1 = _addListener('result', (event: any) => {
        const results = event.results;
        if (results && results.length > 0) {
          const text = results[results.length - 1]?.[0]?.transcript ?? '';
          if (text) accumulatedText.current = text;
        }
      })?.remove;

      const unsub2 = _addListener('end', () => {
        setIsListening(false);
        stopPulse();
        if (accumulatedText.current) {
          onResult(accumulatedText.current);
          accumulatedText.current = '';
        }
      })?.remove;

      const unsub3 = _addListener('error', () => {
        setIsListening(false);
        stopPulse();
      })?.remove;

      if (unsub1) listenersRef.current.push(unsub1);
      if (unsub2) listenersRef.current.push(unsub2);
      if (unsub3) listenersRef.current.push(unsub3);
    } catch {}
  }, [onResult]);

  useEffect(() => {
    return () => {
      listenersRef.current.forEach(fn => { try { fn(); } catch {} });
      listenersRef.current = [];
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  const handlePress = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    }

    if (isListening) {
      if (_speechModule) {
        try { _speechModule.stop?.(); } catch {}
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      stopPulse();
      if (accumulatedText.current) {
        onResult(accumulatedText.current);
        accumulatedText.current = '';
      }
      return;
    }

    // ── Try native expo-speech-recognition ──
    if (checkNativeAvailability() && _speechModule) {
      try {
        const perm = await _speechModule.requestPermissionsAsync();
        if (!perm.granted) {
          showError('请在系统设置中允许麦克风权限');
          return;
        }
        accumulatedText.current = '';
        registerNativeListeners();
        _speechModule.start({ lang: language, interimResults: true, continuous: false });
        setIsListening(true);
        startPulse();
        return;
      } catch (e) {
        console.warn('Native speech recognition failed:', e);
      }
    }

    // ── Web Speech API ──
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.lang = language;
          recognition.interimResults = false;
          recognition.continuous = false;
          recognitionRef.current = recognition;
          accumulatedText.current = '';

          recognition.onresult = (event: any) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                text += event.results[i][0].transcript;
              }
            }
            if (text) accumulatedText.current = text;
          };
          recognition.onend = () => {
            setIsListening(false);
            stopPulse();
            if (accumulatedText.current) {
              onResult(accumulatedText.current);
              accumulatedText.current = '';
            }
            recognitionRef.current = null;
          };
          recognition.onerror = (e: any) => {
            setIsListening(false);
            stopPulse();
            recognitionRef.current = null;
            if (e.error === 'not-allowed') {
              showError('请在浏览器中允许麦克风权限');
            } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
              showError('语音识别出错，请重试');
            }
          };

          recognition.start();
          setIsListening(true);
          startPulse();
          return;
        } catch {
          showError('无法启动语音识别，请直接输入文字');
        }
        return;
      }
    }

    // ── No speech recognition available ──
    showError('当前环境不支持语音输入，请直接打字');
  }, [isListening, language, onResult, registerNativeListeners]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.micBtn, isListening && styles.micBtnActive]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={styles.micIcon}>{isListening ? '🔴' : '🎙️'}</Text>
          <Text style={[styles.micLabel, isListening && styles.micLabelActive]}>
            {isListening ? '停止' : '语音'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  micBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0F7EE', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#D4E8D4',
  },
  micBtnActive: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  micIcon: { fontSize: 18 },
  micLabel: { fontSize: 13, fontWeight: '600', color: '#3D7A3D' },
  micLabelActive: { color: '#DC2626' },
  errorMsg: { fontSize: 11, color: '#DC2626', textAlign: 'center', maxWidth: 160 },
});
