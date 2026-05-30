
import React, { useRef, useEffect, useState } from 'react';
import { Barcode, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const BarcodeInput = ({ onScan, isLoading, onCameraClick }) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus on mount and handle keyboard shortcuts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleGlobalKeyDown = (e) => {
      // Ctrl+B or Cmd+B to focus barcode input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc to clear input
      if (e.key === 'Escape') {
        setValue('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onScan(value.trim());
        // Clear input after scan
        setValue('');
        // Maintain focus for next scan
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 10);
      }
    }
  };

  return (
    <div className={`relative flex w-full md:w-1/2 transition-all duration-200 ${isFocused ? 'ring-2 ring-ring ring-offset-2 rounded-md' : ''}`}>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Barcode className={`h-5 w-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder="Scan barcode atau masukkan kode item... (Ctrl+B)"
          className="pl-10 pr-4 h-12 text-base bg-background border-input shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none border-r-0"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      <Button
        type="button"
        variant="default"
        className="h-12 px-4 rounded-l-none shadow-sm"
        onClick={onCameraClick}
        disabled={isLoading}
        title="Scan dengan Kamera"
      >
        <Camera className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default BarcodeInput;
