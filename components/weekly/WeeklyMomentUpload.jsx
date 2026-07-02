'use client'

import { useRef, useState } from 'react'
import './WeeklyMoment.css'

export default function WeeklyMomentUpload({ onUpload, uploading = false }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  function handlePick() {
    if (uploading) return
    inputRef.current?.click()
  }

  function handleChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith('image/')) {
      alert('Please choose an image.')
      return
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB.')
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleSubmit() {
    if (!file || !onUpload) return
    await onUpload(file)
    setFile(null)
    setPreview(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function handleCancel() {
    setFile(null)
    setPreview(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="weekly-moment-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {!preview ? (
        <button
          type="button"
          className="weekly-moment-upload-btn"
          onClick={handlePick}
          disabled={uploading}
        >
          📸 Add this week&apos;s photo
        </button>
      ) : (
        <div className="weekly-moment-preview">
          <img src={preview} alt="Weekly moment preview" />

          <div>
            <p className="weekly-moment-preview-file">
              {file?.name || 'Selected photo'}
            </p>

            <div className="weekly-moment-preview-actions">
              <button
                type="button"
                className="submit"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Post'}
              </button>

              <button
                type="button"
                className="cancel"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}