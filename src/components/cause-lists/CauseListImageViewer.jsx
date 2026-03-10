/**
 * CauseListImageViewer
 *
 * User-facing multi-page cause list image viewer.
 * Features:
 *  - Thumbnail strip for page navigation
 *  - Pinch-to-zoom / button zoom (CSS transform, no heavy lib)
 *  - Keyboard: ← → arrow keys to change page, +/- to zoom, Esc to reset zoom
 *  - Fullscreen toggle
 *  - Download current page
 *  - Mobile-responsive
 *
 * Props:
 *   images  – array of image objects { id, page_number, image_url, thumbnail_url, width, height, file_size }
 *   date    – string date label shown in header
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.4

export default function CauseListImageViewer({ images = [], date }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  // drag-to-pan state
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const containerRef = useRef(null)

  const current = images[currentIdx]
  const total = images.length

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goTo = useCallback((idx) => {
    setCurrentIdx(idx)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setImgLoaded(false)
  }, [])

  const prev = useCallback(() => goTo(Math.max(0, currentIdx - 1)), [currentIdx, goTo])
  const next = useCallback(() => goTo(Math.min(total - 1, currentIdx + 1)), [currentIdx, total, goTo])

  // ── Zoom ───────────────────────────────────────────────────────────────────

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))))
  const zoomOut = () => {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2)))
      if (next === 1) setPan({ x: 0, y: 0 })
      return next
    })
  }
  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === 'Escape') resetZoom()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  // ── Fullscreen ─────────────────────────────────────────────────────────────

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // ── Drag to pan (when zoomed) ─────────────────────────────────────────────

  const onMouseDown = (e) => {
    if (zoom <= 1) return
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }
  const onMouseMove = (e) => {
    if (!dragging.current) return
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    })
  }
  const onMouseUp = () => { dragging.current = false }

  // ── Download ───────────────────────────────────────────────────────────────

  const download = () => {
    if (!current?.image_url) return
    const a = document.createElement('a')
    a.href = current.image_url
    a.download = `cause-list-page-${current.page_number}.jpg`
    a.click()
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No images available for this cause list.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-gray-950 rounded-2xl overflow-hidden select-none ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-semibold">
            Page {current?.page_number} of {total}
          </span>
          {date && <span className="text-gray-400 text-xs hidden sm:inline">· {date}</span>}
        </div>
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className="icon-btn" title="Zoom out (-)">
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded transition-colors min-w-[3rem] text-center"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className="icon-btn" title="Zoom in (+)">
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          {/* Download */}
          <button onClick={download} className="icon-btn" title="Download page">
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="icon-btn" title="Fullscreen">
            {isFullscreen
              ? <ArrowsPointingInIcon className="h-4 w-4" />
              : <ArrowsPointingOutIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Main image area ── */}
      <div
        className={`relative flex-1 overflow-hidden flex items-center justify-center bg-gray-950 ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ minHeight: isFullscreen ? 'calc(100vh - 7rem)' : '60vh', maxHeight: isFullscreen ? 'calc(100vh - 7rem)' : '72vh' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {current && (
          <img
            key={current.id}
            src={current.image_url}
            alt={`Cause list page ${current.page_number}`}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center',
              transition: dragging.current ? 'none' : 'transform 0.15s ease',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              opacity: imgLoaded ? 1 : 0,
            }}
          />
        )}

        {/* Prev / Next overlay buttons */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center disabled:opacity-20 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              disabled={currentIdx === total - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center disabled:opacity-20 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Keyboard hint (fades in) */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 pointer-events-none">
            ← → arrow keys to navigate · +/- to zoom
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {total > 1 && (
        <div className="flex gap-2 p-3 bg-gray-900 overflow-x-auto flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => goTo(i)}
              className={[
                'flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                i === currentIdx
                  ? 'border-emerald-400 scale-105'
                  : 'border-transparent hover:border-gray-600 opacity-60 hover:opacity-90',
              ].join(' ')}
              style={{ width: 56, height: 72 }}
            >
              <img
                src={img.thumbnail_url || img.image_url}
                alt={`Page ${img.page_number}`}
                className="w-full h-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}

      {/* Inline style block for icon-btn reuse */}
      <style>{`
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          color: #d1d5db;
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover:not(:disabled) { background: #374151; color: #fff; }
        .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
