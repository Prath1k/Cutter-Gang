'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user) return;

    setIsUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('videos')
        .insert([{ 
          title, 
          url: publicUrlData.publicUrl, 
          user_id: user.id 
        }]);

      if (dbError) throw dbError;

      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error uploading video';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return createPortal(
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          padding: '24px',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Members Only</h2>
          <p className="text-neutral-500 text-sm mb-8 font-medium">Please sign in with Google to upload videos to the gang.</p>
          <button 
            onClick={onClose}
            className="w-full bg-black text-white font-black uppercase tracking-tighter py-4 rounded-2xl hover:bg-neutral-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0d0d0d',
          border: '1px solid #262626',
          borderRadius: '32px',
          padding: '40px',
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            color: '#999',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2 style={{
          fontSize: '28px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: '#fff',
          marginBottom: '8px',
          marginTop: 0,
        }}>
          Upload to Gang
        </h2>
        <p className="text-neutral-500 text-sm mb-8 font-medium tracking-tight">Sharing as <span className="text-white font-black">{user.user_metadata.full_name || user.email}</span></p>

        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 900,
              color: '#666',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the vibe?"
              required
              style={{
                width: '100%',
                backgroundColor: '#161616',
                color: '#fff',
                padding: '18px',
                borderRadius: '16px',
                border: '1px solid #262626',
                outline: 'none',
                fontSize: '15px',
                boxSizing: 'border-box',
                fontWeight: '600',
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 900,
              color: '#666',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Select File
            </label>
            <div style={{
              position: 'relative',
              border: '2px dashed #262626',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#161616',
              transition: 'border-color 0.3s',
            }} className="hover:border-red-600/50">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', pointerEvents: 'none' }}>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <Upload style={{ width: '24px', height: '24px', color: '#fff' }} />
                </div>
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                  {file ? file.name : 'Select Video'}
                </span>
                <span className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">Max size: 50MB</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file || !title}
            style={{
              width: '100%',
              backgroundColor: isUploading || !file || !title ? '#1e1e1e' : '#dc2626',
              color: '#fff',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '20px',
              borderRadius: '20px',
              border: 'none',
              cursor: isUploading || !file || !title ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '15px',
              transition: 'all 0.3s',
            }}
            className="hover:scale-[1.02] active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                POURING...
              </>
            ) : (
              'UPLOAD TO GANG'
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function UploadVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 hover:text-red-600 transition-colors text-black"
      >
        <Upload className="w-5 h-5" />
        <span className="hidden sm:inline font-black uppercase tracking-tighter text-sm">Upload</span>
      </button>

      {isOpen && <UploadModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
