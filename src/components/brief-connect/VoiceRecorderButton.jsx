/**
 * VoiceRecorderButton — records a short voice note via MediaRecorder and
 * hands the resulting Blob + duration back to the caller on stop.
 */
import { useRef, useState } from 'react'
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function VoiceRecorderButton({ onRecorded, disabled }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Voice recording is not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const duration = seconds
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timerRef.current)
        setSeconds(0)
        setRecording(false)
        if (duration > 0) onRecorded(blob, duration)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      toast.error('Microphone access was denied.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  function cancelRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    clearInterval(timerRef.current)
    setSeconds(0)
    setRecording(false)
  }

  if (recording) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
    const ss = String(seconds % 60).padStart(2, '0')
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {mm}:{ss}
        </span>
        <button
          type="button"
          onClick={cancelRecording}
          className="text-xs text-gray-400 hover:text-gray-600 px-1.5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={stopRecording}
          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
        >
          <StopIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="w-8 h-8 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors disabled:opacity-40"
      title="Record a voice note"
    >
      <MicrophoneIcon className="h-5 w-5" />
    </button>
  )
}
