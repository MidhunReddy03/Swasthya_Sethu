'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Peer from 'peerjs'
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Maximize2, Minimize2, Users } from 'lucide-react'

export default function VideoCallPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [peer, setPeer] = useState<Peer | null>(null)
  const [callActive, setCallActive] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [pipExpanded, setPipExpanded] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [remotePeerId, setRemotePeerId] = useState('')
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const initPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        const newPeer = new Peer({ debug: 2 })
        
        newPeer.on('open', (id) => {
          console.log('My peer ID:', id)
        })

        newPeer.on('call', (call) => {
          call.answer(stream)
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
          })
          setCallActive(true)
          startTimer()
        })

        setPeer(newPeer)
      } catch (err) {
        console.error('Camera/mic access denied:', err)
      }
    }

    initPeer()

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop())
      peer?.disconnect()
      stopTimer()
    }
  }, [])

  const startTimer = () => {
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const startCall = () => {
    if (!peer || !localStreamRef.current || !remotePeerId) return
    const call = peer.call(remotePeerId, localStreamRef.current)
    call?.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
    })
    setCallActive(true)
    startTimer()
  }

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = !track.enabled)
    setMicOn(m => !m)
  }

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = !track.enabled)
    setCameraOn(c => !c)
  }

  const endCall = async () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    peer?.disconnect()
    setCallActive(false)
    // Mark appointment as completed and redirect to summary
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId)
    router.push(`/dashboard/consultations/summary/${appointmentId}`)
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-gray-950 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Main Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover rounded-2xl bg-gray-900 ${!callActive ? 'hidden' : ''}`}
        />

        {/* Connecting Screen */}
        {!callActive ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-2xl">
            <div className="max-w-md w-full text-center px-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto mb-6 flex items-center justify-center ring-4 ring-blue-500/10">
                <VideoIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start a Consultation</h2>
              <p className="text-gray-400 mb-8">Enter the doctor's peer ID to connect</p>
              
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                <input
                  type="text"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  placeholder="Enter peer ID..."
                  className="w-full px-5 py-3 bg-gray-900/80 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-center text-lg tracking-wider font-mono"
                />
                <button
                  onClick={startCall}
                  disabled={!remotePeerId.trim()}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  Connect Call
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Call Status Overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-full">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse-soft" />
                <span className="text-white text-sm font-medium">{formatDuration(callDuration)}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-full">
                <Users className="w-4 h-4 text-gray-300" />
                <span className="text-white text-sm">Connected</span>
              </div>
            </div>
          </>
        )}

        {/* Picture-in-Picture */}
        <div className={`absolute bottom-6 right-6 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700/80 transition-all duration-300 ${
          pipExpanded ? 'w-64 h-48' : 'w-36 h-28'
        }`}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!cameraOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          )}
          <button
            onClick={() => setPipExpanded(!pipExpanded)}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg hover:bg-black/70 transition"
          >
            {pipExpanded ? <Minimize2 className="w-3.5 h-3.5 text-white" /> : <Maximize2 className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-center gap-4 border-t border-gray-800">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${
            micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
          title={micOn ? 'Mute' : 'Unmute'}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all ${
            cameraOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
          title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button
          onClick={endCall}
          className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
          title="End call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
