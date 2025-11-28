import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Home, SkipForward } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for pdfjs
// Use local worker from public folder (copied from react-pdf's bundled pdfjs-dist@5.4.296)
// This ensures version compatibility with react-pdf
if (typeof window !== 'undefined') {
  // Use the worker from public folder - matches react-pdf's pdfjs-dist version (5.4.296)
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  console.log('PDF.js worker: Using local worker from /pdf.worker.min.mjs');
  console.log('PDF.js version:', pdfjs.version);
}

const PDFViewer = ({ pdfPath, onClose, title }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0); // Default 100% zoom for full-screen mode
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Reset state when PDF path changes
  useEffect(() => {
    console.log('PDFViewer mounted/updated with path:', pdfPath);
    setLoading(true);
    setError(null);
    setNumPages(null);
    setPageNumber(1);
  }, [pdfPath]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded successfully! Pages:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
    console.error('PDF Path:', pdfPath);
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    setError(error.message || 'Failed to load PDF. Please check the file path.');
    setLoading(false);
  };

  const onDocumentLoadProgress = ({ loaded, total }) => {
    console.log('PDF loading progress:', loaded, '/', total);
  };

  // Keyboard controls for full-screen mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't show controls on keyboard navigation
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextPage();
        // Keep controls hidden - don't trigger mouse move handler
        return;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevPage();
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      } else if (e.key === 'Home') {
        e.preventDefault();
        setPageNumber(1);
        return;
      } else if (e.key === 'End') {
        e.preventDefault();
        setPageNumber(numPages);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [numPages]);

  // Full screen API - always request fullscreen when component mounts
  useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    }
    
    return () => {
      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
      }
    };
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages || 1, prev + 1));
  };

  const goToFirstPage = () => {
    setPageNumber(1);
  };

  const goToLastPage = () => {
    setPageNumber(numPages || 1);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.02));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.3, prev - 0.02));
  };

  // Memoize PDF options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version || '5.4.296'}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version || '5.4.296'}/standard_fonts/`,
  }), []); // Empty deps - options don't change


  // Auto-hide controls in full-screen mode
  useEffect(() => {
    // Function to schedule hiding controls
    const scheduleHide = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        console.log('Hiding controls');
        setShowControls(false);
      }, 2000);
    };

    // Show controls on mouse move (but not on keyboard events)
    const handleMouseMove = (e) => {
      // Only show controls on actual mouse movement, not programmatic events
      if (e.isTrusted) {
        console.log('Mouse move detected');
        setShowControls(true);
        scheduleHide();
      }
    };

    // Initial timeout to hide controls after 2 seconds
    scheduleHide();

    // Listen for mouse movement on the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseenter', () => {
        console.log('Mouse enter - showing controls');
        setShowControls(true);
        scheduleHide();
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="flex flex-col w-full h-full rounded-none bg-black">
        {/* Controls */}
        <div 
          className={`flex items-center justify-between p-3 border-b transition-all duration-300 fixed top-0 left-0 right-0 z-30 bg-black bg-opacity-90 text-white border-transparent ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
          onMouseEnter={() => setShowControls(true)}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 text-white"
              aria-label="First page"
              title="First page (Home)"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 text-white"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm min-w-[80px] text-center text-white">
              {pageNumber} / {numPages || '?'}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 text-white"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToLastPage}
              disabled={pageNumber >= (numPages || 1)}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 text-white"
              aria-label="Last page"
              title="Last page (End)"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.3}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm min-w-[60px] text-center text-white">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors text-white"
              aria-label="Close"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions - Auto-hide with controls */}
        {showControls && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-xs z-10 transition-opacity duration-300">
            Use ← → or Space to navigate • Esc to exit
          </div>
        )}

        {/* PDF Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-black p-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-lg text-white">
                Error: {error}
              </div>
              <div className="text-sm text-gray-300">
                PDF Path: {pdfPath}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <Document
              key={pdfPath}
              file={pdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onLoadProgress={onDocumentLoadProgress}
              loading={
                <div className="flex items-center justify-center h-full text-white">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                    <div>Loading PDF...</div>
                    <div className="text-xs mt-2 opacity-70">Path: {pdfPath}</div>
                  </div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-full gap-2 text-white">
                  <div>Failed to load PDF</div>
                  <div className="text-xs">Path: {pdfPath}</div>
                </div>
              }
              options={pdfOptions}
            >
              {numPages ? (
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onLoadError={(error) => {
                    console.error('Page load error:', error);
                    setError(`Page ${pageNumber} failed to load: ${error.message}`);
                  }}
                  loading={
                    <div className="flex items-center justify-center text-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                    </div>
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div>Preparing page...</div>
                </div>
              )}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

