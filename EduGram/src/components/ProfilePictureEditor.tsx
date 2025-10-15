import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface ProfilePictureEditorProps {
  imageUrl: string;
  onSave: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ProfilePictureEditor({ imageUrl, onSave, onCancel }: ProfilePictureEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      // Center the image initially
      const canvas = canvasRef.current;
      if (canvas) {
        const centerX = (canvas.width - img.width) / 2;
        const centerY = (canvas.height - img.height) / 2;
        setPosition({ x: centerX, y: centerY });
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [image, zoom, position, rotation]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Draw image with transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    ctx.drawImage(image, position.x, position.y);

    // Restore context state
    ctx.restore();

    // Draw circular crop overlay
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cut out circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw circle border
    ctx.strokeStyle = '#00D9FF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = 300;
    cropCanvas.height = 300;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Draw the image with transformations
    cropCtx.save();
    cropCtx.translate(cropCanvas.width / 2, cropCanvas.height / 2);
    cropCtx.rotate((rotation * Math.PI) / 180);
    cropCtx.scale(zoom, zoom);
    cropCtx.translate(-cropCanvas.width / 2, -cropCanvas.height / 2);
    
    // Calculate the source rectangle for the circular crop
    const sourceX = (canvas.width / 2 - 150 - position.x) / zoom;
    const sourceY = (canvas.height / 2 - 150 - position.y) / zoom;
    const sourceSize = 300 / zoom;
    
    cropCtx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      300,
      300
    );
    cropCtx.restore();

    // Apply circular mask
    cropCtx.globalCompositeOperation = 'destination-in';
    cropCtx.beginPath();
    cropCtx.arc(150, 150, 150, 0, 2 * Math.PI);
    cropCtx.fill();

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--app-border)]">
          <h3 className="text-[var(--app-text-primary)]">Edit Profile Picture</h3>
          <button
            onClick={onCancel}
            className="text-[var(--app-text-secondary)] hover:text-[var(--app-error)] transition-colors p-2 rounded-lg hover:bg-[var(--app-surface-elevated)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-6 flex justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="border border-[var(--app-border)] rounded-xl cursor-move touch-none"
          />
        </div>

        {/* Controls */}
        <div className="px-6 pb-4 space-y-4">
          {/* Zoom Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[var(--app-text-secondary)] flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </label>
              <span className="text-[var(--app-text-tertiary)]">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[var(--app-text-secondary)] flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotation
              </label>
              <span className="text-[var(--app-text-tertiary)]">{rotation}°</span>
            </div>
            <Slider
              value={[rotation]}
              onValueChange={(values) => setRotation(values[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          <p className="text-[var(--app-text-tertiary)] text-center">
            Drag to reposition • Adjust zoom and rotation as needed
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[var(--app-border)]">
          <Button
            onClick={onCancel}
            className="flex-1 bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text-primary)] hover:border-[var(--app-cyan)] hover:bg-[var(--app-surface)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-br from-[var(--app-cyan)] to-[var(--app-cyan-dark)] text-[var(--app-bg)] shadow-lg hover:shadow-xl transition-all"
          >
            <Check className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
