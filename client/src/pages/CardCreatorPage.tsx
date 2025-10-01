import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import html2canvas from 'html2canvas';

type SuitType = 'hearts' | 'clubs' | 'diamonds' | 'spades';
type LevelType = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'joker';

interface CardData {
  number: string;
  name: string;
  description: string;
  type: SuitType;
  level: LevelType;
  attack: number;
  defense: number;
  imageUrl: string;
}

const suitSymbols: Record<SuitType, string> = {
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦',
  spades: '♠',
};
const levelLabels: Record<LevelType, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  'J': 'J',
  'Q': 'Q',
  'K': 'K',
  'A': 'A',
  'joker': '?',
};

const getSuitColor = (type: SuitType): string => {
  return type === 'hearts' || type === 'diamonds' ? '#dc2626' : '#000000';
};

const CardCreatorPage = () => {
  const [cardData, setCardData] = useState<CardData>({
    number: '0',
    name: '',
    description: '',
    type: 'spades',
    level: '2',
    attack: 0,
    defense: 0,
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'attack' || name === 'defense') {
      const numValue = Math.max(0, Math.min(10000, parseInt(value) || 0));
      setCardData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCardData(prev => ({ ...prev, imageUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) handleImageUpload(file);
          break;
        }
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const clearImage = () => {
    setImageFile(null);
    setCardData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCard = async () => {
    if (!cardPreviewRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    // Print card details as JSON
    const cardDetails = {
      number: cardData.number,
      name: cardData.name,
      description: cardData.description,
      type: cardData.type,
      level: cardData.level,
      attack: cardData.attack,
      defense: cardData.defense,
      hasImage: !!cardData.imageUrl,
      timestamp: new Date().toISOString()
    };
    
    console.log('Card Details:', JSON.stringify(cardDetails, null, 2));
    
    try {
      // High quality canvas rendering with onclone to fix inherited styles
      const canvas = await html2canvas(cardPreviewRef.current, {
        scale: 4, // 4x resolution for crisp output
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        width: cardPreviewRef.current.offsetWidth,
        height: cardPreviewRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // Find all elements in the cloned document that might have computed oklch colors
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i] as HTMLElement;
            
            // Override any computed colors with explicit values
            const computedStyle = window.getComputedStyle(element);
            
            // Check for oklch colors and replace them
            ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 
             'borderBottomColor', 'borderLeftColor'].forEach(prop => {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value.includes('oklch')) {
                // Set to transparent or black as fallback
                if (prop === 'backgroundColor') {
                  element.style.backgroundColor = 'transparent';
                } else if (prop.includes('border')) {
                  element.style[prop as any] = '#000000';
                } else {
                  element.style[prop as any] = '#000000';
                }
              }
            });
          }
        }
      });
      
      // Convert to blob for better quality
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloading(false);
          return;
        }
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.download = `${cardData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'card'}.png`;
        link.href = url;
        link.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(url);
          setIsDownloading(false);
        }, 100);
      }, 'image/png', 1.0); // Maximum quality PNG
      
    } catch (error) {
      console.error('Error generating card image:', error);
      alert('Failed to generate card image. Please try again.');
      setIsDownloading(false);
    }
  };

  return (
    <Layout header="CARD CREATOR">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #3a3a3a' }}>
              <h2 className="text-xl font-bold mb-6 text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.75rem', letterSpacing: '0.05em' }}>CARD DETAILS</h2>
              
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  CARD NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardData.name}
                  onChange={handleInputChange}
                  className="w-full text-white px-4 py-2 focus:outline-none"
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                  placeholder="Enter card name"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  value={cardData.description}
                  onChange={handleInputChange}
                  className="w-full text-white px-4 py-2 focus:outline-none min-h-[100px]"
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                  placeholder="Enter card description"
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  TYPE (SUIT) <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={cardData.type}
                  onChange={handleInputChange}
                  className="w-full text-white px-4 py-2 focus:outline-none"
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                >
                  <option value="hearts">Hearts {suitSymbols.hearts}</option>
                  <option value="clubs">Clubs {suitSymbols.clubs}</option>
                  <option value="diamonds">Diamonds {suitSymbols.diamonds}</option>
                  <option value="spades">Spades {suitSymbols.spades}</option>
                </select>
              </div>

              {/* Level */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  LEVEL <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={cardData.level}
                  onChange={handleInputChange}
                  className="w-full text-white px-4 py-2 focus:outline-none"
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="J">Jack (J)</option>
                  <option value="Q">Queen (Q)</option>
                  <option value="K">King (K)</option>
                  <option value="A">Ace (A)</option>
                  <option value="joker">Joker (?)</option>
                </select>
              </div>

              {/* Attack & Defense */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    ATTACK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="attack"
                    value={cardData.attack}
                    onChange={handleInputChange}
                    min="0"
                    max="10000"
                    className="w-full text-white px-4 py-2 focus:outline-none"
                    style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    DEFENSE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="defense"
                    value={cardData.defense}
                    onChange={handleInputChange}
                    min="0"
                    max="10000"
                    className="w-full text-white px-4 py-2 focus:outline-none"
                    style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                  />
                </div>
              </div>
              <div className="mb-4">
              <label className="block text-sm font-bold text-white mb-2">
                    NUMBER <span className="text-red-500">*</span>
                  </label>
                   <input
                     type="number"
                     name="number"
                     value={cardData.number}
                     onChange={handleInputChange}
                     min="0"
                     max="10000"
                     className="w-full text-white px-4 py-2 focus:outline-none"
                     style={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
                   />
                  </div>
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  UPLOAD IMAGE <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 border-dashed p-4 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: dragActive ? '#D9D9D9' : '#4a4a4a',
                    backgroundColor: imageFile ? '#2a2a2a' : '#1a1a1a'
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !imageFile && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {imageFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={cardData.imageUrl}
                          alt="Preview"
                          className="w-12 h-12 object-cover"
                        />
                        <span className="text-sm" style={{ color: '#D9D9D9' }}>{imageFile.name.substring(0, 20) + (imageFile.name.length > 20 ? '...' : '')}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="text-red-800 hover:text-red-400 text-2xl font-bold px-2 bg-black border-none"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-2" style={{ color: '#6a6a6a' }}>+</div>
                      <p className="text-sm" style={{ color: '#9a9a9a' }}>
                        Drag and Drop, Paste, or<br />Upload Image directly.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #3a3a3a' }}>
              <h2 className="text-xl font-bold mb-6 text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.75rem', letterSpacing: '0.05em' }}>PREVIEW</h2>
              
              {cardData.name && cardData.imageUrl ? (
                <div className="flex flex-col items-center">
                  <div
                    ref={cardPreviewRef}
                    className="card-preview"
                    style={{ width: '350px' }}
                  >
                    {/* Gradient Border Container */}
                    <div 
                      style={{
                        padding: '8px',
                        border: '2px solid #000000',
                        background: 'linear-gradient(180deg, #000000 0%, #1a0000 15%, #330000 25%, #660000 35%, #990000 45%, #cc0000 55%, #ff3333 65%, #ff9999 75%, #ffcccc 85%, #ffffff 100%)'
                      }}
                    >
                      {/* Inner Card Container */}
                      <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Card Header */}
                        <div 
                          style={{
                            background: 'linear-gradient(90deg, #D9D9D9 0%, #f5f5f5 50%, #D9D9D9 100%)',
                            fontFamily: 'Bebas Neue, sans-serif',
                            padding: '0.5rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '2px solid #000000'
                          }}
                        >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {(['J', 'Q', 'K', 'A', 'joker'] as LevelType[]).includes(cardData.level) && (
                            <span 
                              style={{ 
                                color: getSuitColor(cardData.type),
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {levelLabels[cardData.level]}
                            </span>
                          )}
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: '#000000', 
                            fontSize: '1.25rem', 
                            letterSpacing: '0.025em' 
                          }}>
                            {cardData.name}
                          </span>
                        </div>
                        <span 
                          style={{ 
                            fontSize: '1.875rem', 
                            lineHeight: '1',
                            color: getSuitColor(cardData.type)
                          }}
                        >
                          {suitSymbols[cardData.type]}
                        </span>
                      </div>

                      {/* Card Image */}
                      <div style={{ position: 'relative', aspectRatio: '4/5' }}>
                        <img
                          src={cardData.imageUrl}
                          alt={cardData.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Card Footer */}
                      <div 
                        style={{
                          background: 'linear-gradient(135deg,rgb(162, 73, 81) 0%,rgb(130, 53, 60) 50%,rgb(79, 9, 15) 100%)',
                          fontFamily: 'Space Mono, monospace',
                          padding: '0.75rem 1rem',
                          borderTop: '2px solid #000000'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div 
                            style={{
                              fontFamily: 'Bebas Neue, sans-serif',
                              fontSize: '3.5rem',
                              fontWeight: 'bold',
                              color: '#000000',
                              lineHeight: '1'
                            }}
                          >
                            {levelLabels[cardData.level]}
                          </div>
                          <div className="mx-2"
                            style={{
                              fontFamily: 'Space Mono, monospace',
                              fontSize: '0.9rem',
                              color: '#000000'
                            }}
                          >
                            {cardData.description}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ color: '#000000', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            ATTACK: {cardData.attack}
                          </div>
                          <div style={{ color: '#000000', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            DEFENSE: {cardData.defense}
                          </div>
                        </div>
                      </div>

                        {/* Creator Info */}
                        <div 
                          style={{
                            background: 'linear-gradient(90deg, #D9D9D9 0%, #f5f5f5 50%, #D9D9D9 100%)',
                            fontFamily: 'Space Mono, monospace',
                            padding: '0.5rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderTop: '2px solid #000000'
                          }}
                        >
                          <span style={{ color: '#000000', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            山 <span style={{ textDecoration: 'line-through' }}>Warlok</span>
                          </span>
                          <span style={{ color: '#000000', fontSize: '0.75rem', marginLeft: 'auto' }}>{cardData.number}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={downloadCard}
                    disabled={isDownloading}
                    className="mt-6 font-bold px-8 py-3 transition-colors"
                    style={{ 
                      fontFamily: 'Bebas Neue, sans-serif', 
                      fontSize: '1.125rem', 
                      letterSpacing: '0.05em',
                      backgroundColor: isDownloading ? '#2a2a2a' : '#3a3a3a',
                      color: isDownloading ? '#6a6a6a' : '#ffffff',
                      border: '1px solid #4a4a4a',
                      cursor: isDownloading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => {
                      if (!isDownloading) {
                        e.currentTarget.style.backgroundColor = '#4a4a4a';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isDownloading) {
                        e.currentTarget.style.backgroundColor = '#3a3a3a';
                      }
                    }}
                  >
                    {isDownloading ? 'GENERATING...' : 'DOWNLOAD CARD PNG'}
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center" style={{ border: '1px solid #3a3a3a' }}>
                  <p style={{ color: '#6a6a6a' }}>
                    Fill in card details and upload an image to see preview
                  </p>
                </div>
              )}
            </div>

            {/* Description Preview */}
            {cardData.description && (
              <div className="p-6 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #3a3a3a' }}>
                <h3 className="text-sm font-bold mb-2 text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.125rem', letterSpacing: '0.05em' }}>CARD DESCRIPTION</h3>
                <p className="text-sm" style={{ fontFamily: 'Space Mono, monospace', color: '#D9D9D9' }}>{cardData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardCreatorPage;

