import { useEffect, useRef } from 'react'
import { useMatchStore } from '../store/matchStore'
import { useSettingsStore } from '../store/settingsStore'

// ── Lazy AudioContext singleton ────────────────────────────────────────────────
let _ctx: AudioContext | null = null
function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') void _ctx.resume()
  return _ctx
}

// ── Sound primitives ──────────────────────────────────────────────────────────
function tone(freq: number, startTime: number, duration: number, volume = 0.28) {
  const ac = ctx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  osc.connect(gain)
  gain.connect(ac.destination)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

function playPoint() {
  const ac = ctx()
  tone(880, ac.currentTime, 0.06, 0.2)
}

function playSetWin() {
  const ac = ctx()
  const notes = [523, 659, 784]
  notes.forEach((f, i) => tone(f, ac.currentTime + i * 0.13, 0.22))
}

function playMatchWin() {
  const ac = ctx()
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => tone(f, ac.currentTime + i * 0.16, 0.4, 0.32))
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSounds() {
  const { soundEnabled } = useSettingsStore()
  const { sets, currentSetIndex, lastCompletedSet, matchWinner } = useMatchStore()

  // Point sound: fires when the total score in the current set increases
  const prevTotalRef = useRef(0)
  useEffect(() => {
    const s = sets[currentSetIndex]
    if (!s) return
    const total = s.A + s.B
    if (soundEnabled && total > prevTotalRef.current) playPoint()
    prevTotalRef.current = total
  }, [sets, currentSetIndex, soundEnabled])

  // Set-win sound
  const prevSetAlertRef = useRef(lastCompletedSet)
  useEffect(() => {
    if (soundEnabled && lastCompletedSet && lastCompletedSet !== prevSetAlertRef.current) {
      playSetWin()
    }
    prevSetAlertRef.current = lastCompletedSet
  }, [lastCompletedSet, soundEnabled])

  // Match-win sound
  const prevWinnerRef = useRef(matchWinner)
  useEffect(() => {
    if (soundEnabled && matchWinner && !prevWinnerRef.current) playMatchWin()
    prevWinnerRef.current = matchWinner
  }, [matchWinner, soundEnabled])
}
