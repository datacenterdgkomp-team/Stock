
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const AccessoriesDisplay = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground text-sm italic">Tidak ada kelengkapan tambahan</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary" className="px-2.5 py-1 bg-secondary text-secondary-foreground font-medium flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
          {item}
        </Badge>
      ))}
    </div>
  );
};

export default AccessoriesDisplay;
