import { Upload, Video, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * Video Upload Response Interface
 *
 * Defines the structure of the server response after video upload
 */
interface VideoUploadResponse {
  success: boolean;
  message: string;
  data?: {
    path: string; // Relative path in storage
    filename: string; // Unique filename (UUID)
    size: number; // File size in bytes
    mime_type: string; // MIME type of the video
    url: string; // Public URL to the video
    duration?: number; // Video duration in seconds
    width?: number; // Video width in pixels
    height?: number; // Video height in pixels
    codec?: string; // Video codec (e.g., h264)
    frame_rate?: number; // Frames per second
    bitrate?: number; // Bitrate in bits/s
    thumbnail_path?: string; // Relative path to thumbnail
    thumbnail_url?: string; // Public URL to thumbnail
    ffmpeg_warning?: string; // Warning message if FFmpeg failed
  };
}

/**
 * Video Uploader Props Interface
 *
 * Props for controlling the VideoUploader component behavior
 */
interface VideoUploaderProps {
  /** Callback fired when video is successfully uploaded with metadata */
  onUploadComplete: (data: VideoUploadResponse['data']) => void;
  /** Callback fired when upload fails */
  onUploadError?: (error: string) => void;
  /** Maximum file size in bytes (default: 2GB) */
  maxSize?: number;
  /** Accepted video MIME types */
  acceptedTypes?: string[];
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * VideoUploader Component
 *
 * A drag-and-drop video uploader with:
 * - Drag-and-drop interface
 * - Click to browse files
 * - Upload progress indicator
 * - Video preview after upload
 * - Automatic thumbnail generation
 * - File validation (type and size)
 * - Error handling with user-friendly messages
 *
 * Uses react-dropzone for drag-and-drop functionality
 * and Inertia.js router for uploading to Laravel backend
 */
export default function VideoUploader({
  onUploadComplete,
  onUploadError,
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
  acceptedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'],
  className = '',
}: VideoUploaderProps) {
  // State for tracking upload progress and status
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<VideoUploadResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle file drop or selection
   *
   * Uploads the video file to the server using FormData and Inertia router.
   * Shows progress bar during upload and handles success/error responses.
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Reset previous state
      setError(null);
      setUploadedVideo(null);

      // Only process first file
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];

      // Client-side validation
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        const error = `File size exceeds ${maxSizeMB}MB limit`;
        setError(error);
        onUploadError?.(error);
        return;
      }

      // Start upload
      setUploading(true);
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', file);

      // Upload using XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', () => {
        setUploading(false);

        if (xhr.status === 200) {
          try {
            const response: VideoUploadResponse = JSON.parse(xhr.responseText);

            if (response.success && response.data) {
              setUploadedVideo(response.data);
              onUploadComplete(response.data);
              setError(null);
            } else {
              const errorMessage = response.message || 'Upload failed';
              setError(errorMessage);
              onUploadError?.(errorMessage);
            }
          } catch (e) {
            const errorMessage = 'Failed to parse server response';
            setError(errorMessage);
            onUploadError?.(errorMessage);
          }
        } else {
          const errorMessage = `Upload failed with status ${xhr.status}`;
          setError(errorMessage);
          onUploadError?.(errorMessage);
        }
      });

      // Handle upload errors
      xhr.addEventListener('error', () => {
        setUploading(false);
        const errorMessage = 'Network error during upload';
        setError(errorMessage);
        onUploadError?.(errorMessage);
      });

      // Handle upload abort
      xhr.addEventListener('abort', () => {
        setUploading(false);
        setError('Upload cancelled');
      });

      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Send the request
      xhr.open('POST', '/admin/social-media/upload-video');
      if (csrfToken) {
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
      }
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send(formData);
    },
    [maxSize, onUploadComplete, onUploadError],
  );

  /**
   * Configure react-dropzone
   *
   * Handles drag-and-drop events and file selection dialog
   */
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>,
    ),
    maxSize,
    maxFiles: 1,
    disabled: uploading,
  });

  /**
   * Remove uploaded video and reset to initial state
   */
  const handleRemove = () => {
    setUploadedVideo(null);
    setUploadProgress(0);
    setError(null);
  };

  /**
   * Format file size in human-readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Format video duration in MM:SS format
   */
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area - shown when no video is uploaded */}
      {!uploadedVideo && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />

          {/* Upload Icon */}
          <div className="flex justify-center mb-4">
            <Upload className="w-12 h-12 text-gray-400" />
          </div>

          {/* Upload Instructions */}
          {!uploading && (
            <>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isDragActive ? 'Drop your video here' : 'Drag and drop your video here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse files</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                MP4, MOV, AVI, WMV, WebM • Max {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-3">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Uploading video...</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">File rejected:</p>
          <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
            {fileRejections[0].errors.map((error) => (
              <li key={error.code}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Video Preview */}
      {uploadedVideo && (
        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-start gap-4">
            {/* Thumbnail or Video Icon */}
            <div className="flex-shrink-0">
              {uploadedVideo.thumbnail_url ? (
                <img
                  src={uploadedVideo.thumbnail_url}
                  alt="Video thumbnail"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadedVideo.filename}
                  </p>

                  {/* Metadata */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Size:</span> {formatFileSize(uploadedVideo.size)}
                    </div>
                    {uploadedVideo.duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {formatDuration(uploadedVideo.duration)}
                      </div>
                    )}
                    {uploadedVideo.width && uploadedVideo.height && (
                      <div>
                        <span className="font-medium">Resolution:</span> {uploadedVideo.width}x{uploadedVideo.height}
                      </div>
                    )}
                    {uploadedVideo.codec && (
                      <div>
                        <span className="font-medium">Codec:</span> {uploadedVideo.codec.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* FFmpeg Warning */}
                  {uploadedVideo.ffmpeg_warning && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-400">
                      {uploadedVideo.ffmpeg_warning}
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
