import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Check } from 'lucide-react';

import imgGreek from '../../assets/images/yogur_griego_artesanal_1790392468833.jpg';
import imgYogurt from '../../assets/images/yogur_casero_cremoso_1790392479347.jpg';
import imgTart from '../../assets/images/reposteria_temporada_torta_1790392487722.jpg';
import imgParfait from '../../assets/images/postre_artesanal_parfait_1790392496777.jpg';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
}

const PRESETS = [
  { label: 'Yogur Griego', url: imgGreek },
  { label: 'Yogur Casero', url: imgYogurt },
  { label: 'Torta Rústica', url: imgTart },
  { label: 'Parfait de Autor', url: imgParfait }
];

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-[#4A4A4A] uppercase tracking-wider">
        Fotografía del Producto
      </span>

      {/* Drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] bg-[#FAF8F3] ${
          isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-stone-300 hover:border-[#D4AF37]'
        }`}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {value && value.trim() ? (
          <div className="relative w-full h-36 rounded-lg overflow-hidden group">
            <img
              src={value}
              alt="Vista previa"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
              Haz clic para cambiar imagen
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-[#D4AF37]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-stone-700">
              Arrastra una foto aquí o <span className="text-[#D4AF37] underline">explora tus archivos</span>
            </p>
            <p className="text-[11px] text-stone-400">Formatos WebP, JPG, PNG de alta resolución</p>
          </div>
        )}
      </div>

      {/* Preset selector */}
      <div>
        <p className="text-[11px] text-stone-500 mb-1.5 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          O selecciona una foto del estudio de Mi Capricho Secreto:
        </p>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset, idx) => {
            const isSelected = value === preset.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(preset.url)}
                className={`relative rounded-lg overflow-hidden border p-1 text-left transition-all ${
                  isSelected ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 bg-[#FAF8F3]' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-12 object-cover rounded"
                />
                <span className="block text-[10px] text-stone-700 font-medium truncate mt-1">
                  {preset.label}
                </span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
