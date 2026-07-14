/**
 * ChatWindow — real-time chat for a confirmed Brief Connect engagement.
 * Text, images, documents, and voice notes; connects over the existing
 * wsService websocket client and falls back to REST history on load.
 */
import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { PaperAirplaneIcon, PaperClipIcon, DocumentIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { briefChatAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { wsService } from '@/services/websocket'
import { timeAgo } from '@/utils/helpers'
import VoiceRecorderButton from './VoiceRecorderButton'
import EscrowStatusBar from './EscrowStatusBar'

function MessageBubble({ message, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isMine
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-charcoal-900 rounded-bl-sm'
        }`}
      >
        {message.message_type === 'text' && <p className="whitespace-pre-wrap">{message.body}</p>}
        {message.message_type === 'image' && (
          <a href={message.attachment} target="_blank" rel="noreferrer">
            <img src={message.attachment} alt="Attachment" className="rounded-lg max-h-56 object-cover" />
          </a>
        )}
        {message.message_type === 'document' && (
          <a
            href={message.attachment}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 underline ${isMine ? 'text-white' : 'text-emerald-700'}`}
          >
            <DocumentIcon className="h-4 w-4 flex-shrink-0" />
            View document
          </a>
        )}
        {message.message_type === 'voice' && (
          <audio controls src={message.attachment} className="max-w-full" />
        )}
        <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-100' : 'text-gray-400'}`}>
          {timeAgo(message.created_at)}
        </p>
      </div>
    </div>
  )
}

export default function ChatWindow({ engagement }) {
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const [peerTyping, setPeerTyping] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const wsEndpoint = `brief-connect/chat/${engagement.id}`

  const { data, isLoading } = useQuery({
    queryKey: ['brief-chat', engagement.id],
    queryFn: () => briefChatAPI.listMessages(engagement.id),
  })

  useEffect(() => {
    setMessages(data?.data?.results || data?.data || [])
  }, [data])

  useEffect(() => {
    wsService.connect(wsEndpoint, (evt) => {
      if (evt.type === 'chat_message') {
        setMessages((prev) => [...prev, evt.message])
      } else if (evt.type === 'typing') {
        setPeerTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000)
      }
    })
    return () => {
      clearTimeout(typingTimeoutRef.current)
      wsService.disconnect(wsEndpoint)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagement.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: (payload) => briefChatAPI.sendMessage(engagement.id, payload),
    onError: () => toast.error('Could not send message.'),
  })

  function sendText() {
    if (!text.trim()) return
    sendMutation.mutate({ message_type: 'text', body: text.trim() })
    setText('')
  }

  function sendFile(file) {
    const formData = new FormData()
    formData.append('message_type', file.type.startsWith('image/') ? 'image' : 'document')
    formData.append('attachment', file)
    sendMutation.mutate(formData)
  }

  function sendVoice(blob, duration) {
    const formData = new FormData()
    formData.append('message_type', 'voice')
    formData.append('attachment', blob, `voice-note-${duration}s.webm`)
    formData.append('duration_seconds', String(duration))
    sendMutation.mutate(formData)
  }

  function handleTyping(e) {
    setText(e.target.value)
    wsService.send(wsEndpoint, { action: 'typing' })
  }

  const peerName = user?.id === engagement.requester
    ? engagement.holding_lawyer_name
    : engagement.requester_name

  return (
    <div className="flex flex-col h-[70vh] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <p className="text-sm font-semibold text-charcoal-900">{peerName}</p>
        <p className="text-xs text-gray-400">{engagement.status_display}</p>
      </div>

      <EscrowStatusBar engagement={engagement} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="skeleton h-10 rounded-xl" />
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.sender === user?.id} />
          ))
        )}
        {peerTyping && <p className="text-xs text-gray-400 italic">{peerName} is typing…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors flex-shrink-0"
          title="Attach a file"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) sendFile(f)
            e.target.value = ''
          }}
        />
        <VoiceRecorderButton onRecorded={sendVoice} disabled={sendMutation.isLoading} />
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); sendText() }
          }}
          placeholder="Type a message…"
          className="input-field flex-1 text-sm"
        />
        <button
          type="button"
          onClick={sendText}
          disabled={!text.trim() || sendMutation.isLoading}
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
