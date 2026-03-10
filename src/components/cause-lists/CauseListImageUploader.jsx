/**
 * CauseListImageUploader
 *
 * Staff-facing component for uploading cause-list photos.
 * Supports:
 *  - Drag & drop or file picker (multiple files)
 *  - Image preview with page-number labels
 *  - Drag-to-reorder pages
 *  - Per-file upload progress
 *  - Existing images management (view / delete)
 *
 * Props:
 *   causeListId  – string UUID of the cause list
 *   existingImages – array of image objects from the API
 *   onUploaded   – callback called after a successful upload batch
 */
import { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline'
import { causeListsAPI } from '@/services/api'

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE_MB = 20

// Detect mobile / camera availability
const HAS_CAMERA = typeof navigator !== 'undefined' &&
  typeof navigator.mediaDevices !== 'undefined'

// ─── File preview item ────────────────────────────────────────────────────────

function PreviewItem({ file, index, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const url = URL.createObjectURL(file)
  const sizeMB = (file.size / 1024 / 1024).toFixed(1)

  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <img
        src={url}
        alt={`Page ${index + 1}`}
        className="w-full h-36 object-cover object-top"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      {/* Page badge */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        Pg {index + 1}
      </div>
      {/* Remove */}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
      {/* Reorder arrows */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && (
          <button onClick={() => onMoveUp(index)} className="w-5 h-5 rounded bg-black/50 text-white flex items-center justify-center text-xs">↑</button>
        )}
        {!isLast && (
          <button onClick={() => onMoveDown(index)} className="w-5 h-5 rounded bg-black/50 text-white flex items-center justify-center text-xs">↓</button>
        )}
      </div>
      <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-600 truncate">{file.name}</p>
        <p className="text-[10px] text-gray-400">{sizeMB} MB</p>
      </div>
    </div>
  )
}

// ─── Existing image item ──────────────────────────────────────────────────────

function ExistingItem({ image, onDelete, isDeleting }) {
  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <img
        src={image.thumbnail_url || image.image_url}
        alt={`Page ${image.page_number}`}
        className="w-full h-36 object-cover object-top"
      />
      <div className="absolute top-2 left-2 bg-emerald-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        Pg {image.page_number}
      </div>
      <button
        onClick={() => onDelete(image.id)}
        disabled={isDeleting}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
      <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          {image.width} × {image.height} · {(image.file_size / 1024).toFixed(0)} KB
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CauseListImageUploader({ causeListId, existingImages = [], onUploaded }) {
  const queryClient = useQueryClient()
  const [files, setFiles] = useState([])       // staged files
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState(null) // null | 'uploading' | 'done' | 'error'
  const [uploadResult, setUploadResult] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // ── File handling ─────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter((f) => {
      if (!ACCEPTED.includes(f.type) && !f.name.toLowerCase().endsWith('.heic')) return false
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false
      return true
    })
    setFiles((prev) => [...prev, ...valid])
  }, [])

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))
  const moveUp = (idx) => {
    if (idx === 0) return
    setFiles((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }
  const moveDown = (idx) => {
    setFiles((prev) => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  // ── Upload mutation ───────────────────────────────────────────────────────

  const uploadMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      files.forEach((f) => formData.append('images', f))
      formData.append('page_start', (existingImages.length + 1).toString())
      return causeListsAPI.uploadImages(causeListId, formData)
    },
    onMutate: () => {
      setUploadState('uploading')
      setUploadResult(null)
    },
    onSuccess: (res) => {
      setUploadState('done')
      setUploadResult(res.data)
      setFiles([])
      // Invalidate all cause-list caches so users see the new images immediately
      queryClient.invalidateQueries(['causeList'])
      queryClient.invalidateQueries(['admin', 'cause-lists'])
      onUploaded?.()
    },
    onError: (err) => {
      setUploadState('error')
      setUploadResult({ message: err?.response?.data?.message || 'Upload failed.' })
    },
  })

  // ── Delete mutation ───────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (imageId) => causeListsAPI.deleteImage(causeListId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['causeList'])
      onUploaded?.()
    },
  })

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Uploaded Pages ({existingImages.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingImages.map((img) => (
              <ExistingItem
                key={img.id}
                image={img}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          'border-2 border-dashed rounded-2xl transition-colors',
          isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200',
        ].join(' ')}
      >
        {/* Camera snap button (prominent, mobile-first) */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="w-full flex flex-col items-center gap-3 py-8 px-6 rounded-t-2xl hover:bg-emerald-50 transition-colors group"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
            <CameraIcon className="h-8 w-8 text-emerald-700" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-charcoal-900">Take a Photo</p>
            <p className="text-xs text-gray-500 mt-0.5">Open camera to snap the cause list</p>
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 px-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* File picker */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-5 px-6 rounded-b-2xl hover:bg-gray-50 transition-colors text-sm text-gray-500 hover:text-charcoal-700"
        >
          <PhotoIcon className="h-5 w-5" />
          <span>Browse files <span className="text-gray-400">(JPEG, PNG, WEBP, HEIC · max {MAX_SIZE_MB} MB)</span></span>
        </button>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Staged previews */}
      {files.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ready to upload — {files.length} page{files.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {files.map((f, i) => (
              <PreviewItem
                key={i}
                file={f}
                index={i}
                onRemove={removeFile}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                isFirst={i === 0}
                isLast={i === files.length - 1}
              />
            ))}
          </div>

          <button
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            {uploadMutation.isPending
              ? `Uploading ${files.length} page${files.length !== 1 ? 's' : ''}…`
              : `Upload ${files.length} page${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Upload result feedback */}
      {uploadState === 'done' && uploadResult && (
        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{uploadResult.uploaded} page{uploadResult.uploaded !== 1 ? 's' : ''} uploaded successfully.</p>
            {uploadResult.errors?.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">{uploadResult.errors.length} file(s) failed.</p>
            )}
          </div>
        </div>
      )}
      {uploadState === 'error' && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          {uploadResult?.message || 'Upload failed. Please try again.'}
        </div>
      )}
    </div>
  )
}
