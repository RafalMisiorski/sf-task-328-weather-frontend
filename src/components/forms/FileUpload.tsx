import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  value?: File | File[] | string | string[]
  onChange: (files: File | File[] | null) => void
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  disabled?: boolean
  label?: string
  description?: string
  error?: string
}

interface UploadedFile {
  file: File
  preview?: string
  progress?: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({
  value,
  onChange,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  disabled = false,
  label,
  description,
  error,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const isImage = accept.includes('image')

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((f) => f.errors[0]?.message).join(', ')
        console.error('File upload errors:', errors)
        return
      }

      if (acceptedFiles.length === 0) return

      // Create preview URLs for images
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        status: 'success' as const,
      }))

      setUploadedFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles))

      // Call onChange with File objects
      if (multiple) {
        const allFiles = [...uploadedFiles.map((f) => f.file), ...acceptedFiles]
        onChange(allFiles)
      } else {
        onChange(acceptedFiles[0])
      }
    },
    [multiple, onChange, uploadedFiles, isImage]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)

    // Revoke preview URL
    if (uploadedFiles[index].preview) {
      URL.revokeObjectURL(uploadedFiles[index].preview!)
    }

    if (multiple) {
      onChange(newFiles.length > 0 ? newFiles.map((f) => f.file) : null)
    } else {
      onChange(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive || dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <Upload
            className={`w-12 h-12 mb-4 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`}
          />

          <p className="text-sm text-gray-600 mb-2">
            {isDragActive ? (
              <span className="text-blue-500 font-medium">Drop files here</span>
            ) : (
              <>
                <span className="text-blue-500 font-medium">Click to upload</span> or
                drag and drop
              </>
            )}
          </p>

          <p className="text-xs text-gray-500">
            {accept === '*/*' ? 'Any file type' : accept.split(',').join(', ')}
            {' • '}
            Max {formatFileSize(maxSize)}
            {multiple && ' • Multiple files allowed'}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview or icon */}
              <div className="flex-shrink-0">
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0">
                {uploadedFile.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {uploadedFile.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}