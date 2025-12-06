
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  src: string;
  onCrop: (base64: string) => void;
  onCancel: () => void;
  circular?: boolean;
}

const ImageCropper: React.FC<Props> = ({ src, onCrop, onCancel, circular = false }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions of the crop area
  const CROP_SIZE = 280;

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const executeCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !imageRef.current) return;

    // Set output resolution
    canvas.width = 500;
    canvas.height = 500;

    // Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling logic based on what is visible in the CROP_SIZE container
    // The visual container is CROP_SIZE x CROP_SIZE
    // The image is scaled by `zoom` visually.
    
    // We need to map the visual offset and zoom to the actual image natural dimensions.
    const image = imageRef.current;
    
    // Ratios of natural size vs displayed size (before zoom)
    // We assume the image is "contain" styled or similar in the view, but here we render it purely based on math.
    // Let's simplify: We draw the image onto the canvas using the same transform logic but scaled up.
    
    // Scale factor from Visual Crop Box -> Output Canvas
    const outputScale = canvas.width / CROP_SIZE;

    // Draw parameters
    ctx.save();
    
    if (circular) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI);
        ctx.clip();
    }

    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Apply offset (scaled)
    ctx.translate(offset.x * outputScale, offset.y * outputScale);
    // Apply zoom
    ctx.scale(zoom, zoom);
    
    // Draw image centered
    // We need to know the rendered width/height of the image in the viewer to maintain aspect ratio
    // Assume we fit the image into the CROP_SIZE initially?
    // Let's rely on the image's natural aspect ratio.
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    let drawWidth = CROP_SIZE;
    let drawHeight = CROP_SIZE;
    
    if (aspectRatio > 1) {
        drawHeight = CROP_SIZE / aspectRatio;
    } else {
        drawWidth = CROP_SIZE * aspectRatio;
    }
    
    // Scale up to output size
    drawWidth *= outputScale;
    drawHeight *= outputScale;

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <h3 className="text-white text-lg font-bold mb-4">Adjust Image</h3>
      
      <div 
        className="relative overflow-hidden bg-zinc-900 border-2 border-zinc-700"
        style={{ width: CROP_SIZE, height: CROP_SIZE, borderRadius: circular ? '50%' : '12px' }}
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img 
            ref={imageRef}
            src={src} 
            alt="Crop target" 
            draggable={false}
            className="absolute max-w-none origin-center select-none touch-none"
            style={{ 
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                left: '50%',
                top: '50%',
                // Ensure image fits nicely initially
                width: '100%',
                height: 'auto',
                minHeight: '100%',
                minWidth: '100%',
                objectFit: 'contain'
            }}
        />
        {/* Overlay grid for visual aid */}
        <div className="absolute inset-0 pointer-events-none border border-white/20">
            <div className="absolute top-1/3 left-0 w-full h-px bg-white/20"></div>
            <div className="absolute top-2/3 left-0 w-full h-px bg-white/20"></div>
            <div className="absolute top-0 left-1/3 h-full w-px bg-white/20"></div>
            <div className="absolute top-0 left-2/3 h-full w-px bg-white/20"></div>
        </div>
      </div>

      <div className="w-64 mt-6 flex items-center gap-4">
        <span className="text-white/70 text-xs">−</span>
        <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <span className="text-white/70 text-xs">+</span>
      </div>

      <div className="flex gap-4 mt-8 w-full max-w-xs">
        <button 
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-700"
        >
            Cancel
        </button>
        <button 
            onClick={executeCrop}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
            Crop & Save
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
