import { Camera, Image as ImageIcon, Trash2, X } from 'lucide-react';

interface ProfilePictureChangeModalProps {
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  onRemovePhoto: () => void;
  onClose: () => void;
  hasPhoto: boolean;
}

export function ProfilePictureChangeModal({
  onTakePhoto,
  onChooseFromGallery,
  onRemovePhoto,
  onClose,
  hasPhoto,
}: ProfilePictureChangeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Modal */}
      <div className="bg-[var(--app-surface)] border-t sm:border border-[var(--app-border)] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--app-border)]">
          <h3 className="text-[var(--app-text-primary)]">Change Profile Picture</h3>
          <button
            onClick={onClose}
            className="text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--app-surface-elevated)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {/* Take Photo */}
          <button
            onClick={onTakePhoto}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] hover:border-[var(--app-cyan)] hover:bg-[var(--app-cyan-light)] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--app-cyan)] to-[var(--app-cyan-dark)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-[var(--app-bg)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[var(--app-text-primary)] font-medium">Take Photo</p>
              <p className="text-[var(--app-text-secondary)]">Use your camera</p>
            </div>
          </button>

          {/* Choose from Gallery */}
          <button
            onClick={onChooseFromGallery}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] hover:border-[var(--app-cyan)] hover:bg-[var(--app-cyan-light)] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--app-cyan)] to-[var(--app-cyan-dark)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6 text-[var(--app-bg)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[var(--app-text-primary)] font-medium">Choose from Gallery</p>
              <p className="text-[var(--app-text-secondary)]">Select an existing photo</p>
            </div>
          </button>

          {/* Remove Photo - Only show if user has a photo */}
          {hasPhoto && (
            <button
              onClick={onRemovePhoto}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] hover:border-red-500 hover:bg-red-500/10 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-red-500 font-medium">Remove Photo</p>
                <p className="text-[var(--app-text-secondary)]">Use default avatar</p>
              </div>
            </button>
          )}
        </div>

        {/* Cancel Button */}
        <div className="p-4 border-t border-[var(--app-border)]">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text-primary)] hover:border-[var(--app-cyan)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
