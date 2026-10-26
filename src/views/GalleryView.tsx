import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Calendar, Tag, ZoomIn, X, ChevronRight } from 'lucide-react';
import { GalleryPhoto } from '../types.ts';
import { api } from '../services/api.ts';

interface GalleryViewProps {
  onOpenEnroll?: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onOpenEnroll }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const publicData = await api.getPublicData();
        setPhotos(publicData?.gallery || []);
      } catch (err) {
        console.error('Failed to load gallery photos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const categories = ['All', 'Live Classes', 'Labs', 'Study Sessions', 'Achievements'];

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ImageIcon className="w-4 h-4" />
          Hub Media Archive
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Life & Learning at Holiday Tuition Hub
        </h1>
        <p className="max-w-2xl mx-auto text-base text-slate-300">
          A visual journey through our interactive live online classes, practical science demonstrations, active peer discussions, and student academic milestones.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-850">
            <p className="text-slate-400">No photos in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700/80 hover:border-emerald-500/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col"
              >
                {/* Photo container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 text-emerald-300 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {photo.category}
                  </span>

                  {/* Zoom hint icon */}
                  <div className="absolute bottom-3 right-3 p-2 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                {/* Meta details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1.5">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {photo.caption || photo.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-750 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {photo.uploadedAt || photo.dateAdded}
                    </span>
                    <span className="text-emerald-400 font-medium group-hover:underline flex items-center gap-0.5">
                      View photo <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large image */}
            <div className="max-h-[65vh] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Photo description */}
            <div className="p-6 bg-slate-800 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activePhoto.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {activePhoto.uploadedAt || activePhoto.dateAdded}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{activePhoto.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {activePhoto.caption || activePhoto.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Holiday Tuition Hub Media Gallery
                </span>
                {onOpenEnroll && (
                  <button
                    onClick={() => {
                      setActivePhoto(null);
                      onOpenEnroll();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
