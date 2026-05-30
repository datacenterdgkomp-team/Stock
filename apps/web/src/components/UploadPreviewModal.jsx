
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const UploadPreviewModal = ({ 
  open, 
  onClose, 
  previewData, 
  onConfirm, 
  isImporting 
}) => {
  if (!previewData) return null;

  const { valid, errors, all } = previewData;
  const totalRows = all.length;
  const errorCount = errors.length;
  const validCount = valid.length;

  const displayRows = [...errors, ...valid].slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isImporting && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>Preview Import Barang</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-foreground flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              Total Data: {totalRows} baris
            </span>
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="w-4 h-4" /> Valid: {validCount}
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-destructive font-medium">
                <AlertCircle className="w-4 h-4" /> Error: {errorCount}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto p-6 bg-muted/20">
          {errorCount > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Ditemukan {errorCount} baris dengan format tidak valid:
              </p>
              <ul className="list-disc list-inside pl-6 space-y-1">
                {errors.slice(0, 3).map((err, i) => (
                  <li key={i}>Baris {err.row}: {err.messages.join(', ')}</li>
                ))}
                {errorCount > 3 && (
                  <li className="font-medium">...dan {errorCount - 3} error lainnya.</li>
                )}
              </ul>
            </div>
          )}

          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px]">Baris</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead className="min-w-[200px]">Nama Barang</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.length > 0 ? (
                  displayRows.map((item, index) => (
                    <TableRow key={index} className={item.messages ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">{item.row}</TableCell>
                      <TableCell>{item.data['Kode Barang'] || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="truncate max-w-[200px]">{item.data['Nama Barang'] || '-'}</span>
                          {item.messages && (
                            <span className="text-xs text-destructive font-medium">
                              {item.messages[0]}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.data['Harga Beli']?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{item.data['Stok'] || 0}</TableCell>
                      <TableCell>
                        {item.messages ? (
                          <Badge variant="destructive" className="text-[10px]">Error</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Valid</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      Tidak ada data yang dapat dipreview
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalRows > 10 && (
              <div className="p-3 text-center text-xs text-muted-foreground bg-muted/30 border-t">
                Menampilkan 10 baris pertama dari {totalRows} baris.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-card shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Batal
          </Button>
          
          {validCount > 0 && errorCount > 0 && (
            <Button 
              variant="secondary" 
              onClick={() => onConfirm(true)} 
              disabled={isImporting}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Skip Error & Import ({validCount})
            </Button>
          )}

          <Button 
            onClick={() => onConfirm(false)} 
            disabled={isImporting || (errorCount > 0)}
            className="shadow-sm"
          >
            {isImporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengimpor...</>
            ) : (
              `Import Semua Data (${totalRows})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPreviewModal;
