
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SummaryCard = ({ title, value, icon: Icon, trend, loading, variant = 'default' }) => {
  if (loading) {
    return (
      <Card className="shadow-sm border-none bg-card">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return 'border-l-4 border-l-primary bg-primary/5';
      case 'success': return 'border-l-4 border-l-[hsl(var(--success))] bg-[hsl(var(--success))]/5';
      case 'danger': return 'border-l-4 border-l-destructive bg-destructive/5';
      default: return 'border border-border bg-card hover:shadow-md transition-shadow';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-[hsl(var(--success))]';
      case 'danger': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`shadow-sm ${getVariantStyles()}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className={`text-2xl font-bold ${variant !== 'default' ? getIconColor() : 'text-foreground'}`}>
              {value}
            </h3>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1 mt-2">
                {trend}
              </p>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl ${variant !== 'default' ? 'bg-background/50' : 'bg-muted'}`}>
              <Icon className={`w-5 h-5 ${getIconColor()}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
