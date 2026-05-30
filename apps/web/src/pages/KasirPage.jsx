
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import BarcodeInput from '@/components/BarcodeInput.jsx';
import BarcodeScanner from '@/components/BarcodeScanner.jsx';
import InvoicePrintModal from '@/components/InvoicePrintModal.jsx';
import PaymentTransferForm from '@/components/PaymentTransferForm.jsx';
import PaymentQRISForm from '@/components/PaymentQRISForm.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { cn } from '@/lib/utils.js';
import { Search, Loader2, Plus, Receipt, ShoppingCart, AlertCircle, RefreshCw, Package, Trash2, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { usePaymentMethods } from '@/hooks/usePaymentMethods.js';
import { motion, AnimatePresence } from 'framer-motion';
import { scanBarcode } from '@/lib/scanBarcode.js';
import { logActivity } from '@/lib/ActivityLogHelper.js';

const KasirPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const cartEndRef = useRef(null);
  
  const { methods: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  
  const [discount, setDiscount] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [storeSettings, setStoreSettings] = useState(null);
  
  // Payment Flow State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('tunai'); // tunai, transfer, qris
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Final Transaction State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [usedPaymentMethod, setUsedPaymentMethod] = useState(null);

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(p => 
        p.nama.toLowerCase().includes(query) ||
        p.kode_barang.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (cart.length > 0 && cartEndRef.current) {
      cartEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cart.length]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const records = await pb.collection('barang').getFullList({
        sort: 'nama',
        $autoCancel: false
      });
      setProducts(records);
      setFilteredProducts(records);
    } catch (error) {
      console.error('Error loading products:', error);
      setProductError('Gagal memuat data barang.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await pb.collection('pengaturan_toko').getFullList({ $autoCancel: false });
      if (settings.length > 0) {
        setStoreSettings(settings[0]);
        if (settings[0].pajak_default) setTaxRate(settings[0].pajak_default);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const validateStockAvailability = async (barangId, requestedQty) => {
    try {
      const product = await pb.collection('barang').getOne(barangId, { $autoCancel: false });
      if (product.stok < requestedQty) {
        return { 
          isValid: false, 
          availableStock: product.stok, 
          message: `Stok tidak cukup. Stok tersedia: ${product.stok} unit` 
        };
      }
      return { isValid: true, availableStock: product.stok, message: 'Stok tersedia' };
    } catch (error) {
      console.error('Error validating stock:', error);
      return { isValid: false, availableStock: 0, message: 'Gagal memvalidasi stok barang' };
    }
  };

  const handleBarcodeScan = async (barcode) => {
    setIsScanning(true);
    try {
      const result = await scanBarcode(barcode);
      if (!result.success) {
        if (result.error !== 'empty') {
          toast[result.error === 'out_of_stock' ? 'warning' : 'error'](result.message);
        }
        return;
      }
      await addToCart(result.item, true);
    } finally {
      setIsScanning(false);
    }
  };

  const addToCart = async (product, fromScan = false) => {
    if (isValidatingStock) return;
    
    const existing = cart.find(item => item.id === product.id);
    const requestedQty = existing ? existing.qty + 1 : 1;
    
    setIsValidatingStock(true);
    try {
      const validation = await validateStockAvailability(product.id, requestedQty);
      
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      if (existing) {
        setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        toast.success(fromScan ? `Kuantitas ditambah` : `Ditambah ke keranjang`);
      } else {
        setCart([...cart, { ...product, qty: 1 }]);
        toast.success(fromScan ? `${product.nama} ditambahkan` : `${product.nama} ditambahkan ke keranjang`);
      }
    } finally {
      setIsValidatingStock(false);
    }
  };

  const updateCartQty = async (productId, newQty) => {
    if (newQty < 1) return;
    if (isValidatingStock) return;
    
    setIsValidatingStock(true);
    try {
      const validation = await validateStockAvailability(productId, newQty);
      
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }
      
      setCart(cart.map(item => item.id === productId ? { ...item, qty: newQty } : item));
    } finally {
      setIsValidatingStock(false);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);
  const calculateTax = () => calculateSubtotal() * (taxRate / 100);
  const calculateTotal = () => Math.max(0, calculateSubtotal() + calculateTax() - (parseFloat(discount) || 0));
  
  const getChangeAmount = () => {
    const paid = parseFloat(cashAmount) || 0;
    return paid - calculateTotal();
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    setShowPaymentModal(true);
  };

  const executePayment = async (paymentDetails) => {
    setIsProcessing(true);
    try {
      // 1. Validate stock for ALL items in cart before processing
      for (const item of cart) {
        const validation = await validateStockAvailability(item.id, item.qty);
        if (!validation.isValid) {
          toast.error(`Stok barang ${item.nama} tidak cukup. Tersedia: ${validation.availableStock}`);
          setIsProcessing(false);
          return;
        }
      }

      const transactionNumber = `TRX-${Date.now()}`;
      const items = cart.map(item => ({
        barang_id: item.id,
        nama: item.nama,
        qty: item.qty,
        harga_satuan: item.harga_jual,
        subtotal: item.harga_jual * item.qty
      }));

      // 2. Create Transaction
      const transactionData = {
        nomor_transaksi: transactionNumber,
        tanggal: new Date().toISOString(),
        total: calculateTotal(),
        pajak: calculateTax(),
        metode_pembayaran: paymentDetails.methodName,
        kasir: currentUser.id,
        items: items,
        catatan: discount ? `Diskon: Rp ${parseFloat(discount)}` : ''
      };
      
      const transaction = await pb.collection('transaksi_penjualan').create(transactionData, { $autoCancel: false });

      // 3. Reduce Stock
      for (const item of cart) {
        try {
          const product = await pb.collection('barang').getOne(item.id, { $autoCancel: false });
          const newStock = product.stok - item.qty;
          
          if (newStock < 0) {
            throw new Error(`Stok ${product.nama} tidak boleh kurang dari 0`);
          }
          
          await pb.collection('barang').update(item.id, { stok: newStock }, { $autoCancel: false });
        } catch (err) {
          console.error(`Failed to update stock for ${item.nama}:`, err);
          toast.error(`Gagal memperbarui stok untuk ${item.nama}. Silakan periksa inventori.`);
        }
      }

      // 4. Update Rekap Harian
      await syncRekapHarian(paymentDetails.methodName, calculateTotal(), calculateTax(), parseFloat(discount) || 0);

      // 5. Log Activity
      await logActivity('Transaksi Penjualan', 'Kasir', `Transaksi ${transactionNumber} senilai Rp ${calculateTotal()}`, 'Sukses');

      const expandedTx = await pb.collection('transaksi_penjualan').getOne(transaction.id, { expand: 'kasir', $autoCancel: false });
      
      setLastTransaction({ ...expandedTx, change: paymentType === 'tunai' ? getChangeAmount() : 0 });
      setUsedPaymentMethod(paymentMethods.find(m => m.id === paymentDetails.methodId) || { nama: paymentDetails.methodName });
      
      setShowPaymentModal(false);
      setShowInvoiceModal(true);
      
      // Reset State
      setCart([]);
      setCashAmount('');
      setDiscount('');
      setPaymentType('tunai');
      loadProducts(); // reload stock
      
      toast.success('Transaksi berhasil diproses');
    } catch (error) {
      console.error('Payment execution error:', error);
      toast.error('Gagal memproses transaksi. Silakan coba lagi.');
      await logActivity('Transaksi Penjualan', 'Kasir', `Gagal proses transaksi`, 'Gagal');
    } finally {
      setIsProcessing(false);
    }
  };

  const syncRekapHarian = async (methodName, total, tax, disc) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0] + ' 00:00:00.000Z';
      let recap;
      try {
        recap = await pb.collection('rekap_harian').getFirstListItem(`tanggal >= "${todayStr}"`, { $autoCancel: false });
      } catch (e) {
        // Not found, will create
      }

      if (recap) {
        const bd = recap.metode_breakdown || {};
        bd[methodName] = (bd[methodName] || 0) + total;
        
        await pb.collection('rekap_harian').update(recap.id, {
          total_transaksi: recap.total_transaksi + 1,
          total_penjualan: recap.total_penjualan + total,
          total_diskon: recap.total_diskon + disc,
          total_pembayaran: recap.total_pembayaran + total,
          metode_breakdown: bd
        }, { $autoCancel: false });
      } else {
        await pb.collection('rekap_harian').create({
          tanggal: new Date().toISOString(),
          total_transaksi: 1,
          total_penjualan: total,
          total_diskon: disc,
          total_pembayaran: total,
          metode_breakdown: { [methodName]: total }
        }, { $autoCancel: false });
      }
    } catch (e) {
      console.error('Failed to sync rekap_harian', e);
    }
  };

  const handleCashPayment = () => {
    if (!cashAmount || parseFloat(cashAmount) < calculateTotal()) {
      toast.error('Jumlah dibayarkan kurang dari total');
      return;
    }
    const tunaiMethod = paymentMethods.find(m => m.tipe_metode === 'tunai');
    executePayment({
      methodId: tunaiMethod?.id || '',
      methodName: tunaiMethod?.nama || 'Tunai',
      amountPaid: parseFloat(cashAmount)
    });
  };

  return (
    <>
      <Helmet>
        <title>Kasir - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-3 md:p-6 bg-secondary/20 overflow-hidden flex flex-col">
            <div className="mb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-h2 font-bold mb-0.5 tracking-tight">Kasir POS</h1>
                <p className="text-small text-muted-foreground">Sistem Point of Sale Compact</p>
              </div>
              <div className="bg-card px-3 py-1.5 border rounded-lg shadow-sm font-mono font-medium flex items-center gap-1.5 text-small">
                <Receipt className="w-3.5 h-3.5 text-primary" />
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="mb-3 shrink-0">
              <BarcodeInput 
                onScan={handleBarcodeScan} 
                isLoading={isScanning || isValidatingStock} 
                onCameraClick={() => setIsScannerOpen(true)}
              />
            </div>

            <div className="grid lg:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* Product Grid */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-3 border-b bg-card z-10 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    <Input
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-body"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 bg-secondary/10">
                  {isLoadingProducts ? (
                    <div className="product-grid">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
                          <Skeleton className="aspect-square w-full rounded-none" />
                          <div className="p-3 space-y-2">
                            <Skeleton className="h-3 w-3/4" />
                            <div className="pt-2 flex justify-between items-end">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-6 w-6 rounded-md" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div className="product-grid">
                      {filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          className={cn("product-card", isValidatingStock && "opacity-50 pointer-events-none")} 
                          onClick={() => addToCart(product)}
                        >
                          {product.photo ? (
                            <img 
                              src={pb.files.getUrl(product, product.photo, { thumb: '200x200f' })} 
                              alt={product.nama}
                              className="w-full aspect-square object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                              <Package className="w-8 h-8 opacity-20" />
                            </div>
                          )}
                          <div className="p-2.5 flex flex-col flex-1">
                            <div className="flex justify-between items-start gap-1 mb-1">
                              <h3 className="text-[13px] font-semibold leading-tight line-clamp-2">{product.nama}</h3>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-1 font-mono">{product.kode_barang}</p>
                            <div className="mt-auto pt-2 flex items-center justify-between">
                              <span className="text-[13px] font-bold text-primary">Rp {product.harga_jual.toLocaleString('id-ID')}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">
                                Stok: {product.stok}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <AlertCircle className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-body font-medium">Tidak ada produk</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Section */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-3 border-b bg-card z-10 shrink-0 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <h2 className="text-h3 font-semibold">Keranjang</h2>
                  </div>
                  <Badge variant="secondary" className="text-tiny px-2 py-0">
                    {cart.reduce((sum, i) => sum + i.qty, 0)} item
                  </Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 bg-background/50">
                  <AnimatePresence initial={false}>
                    {cart.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="cart-item-row"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-[12px] font-semibold truncate">{item.nama}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] font-medium text-primary">Rp {item.harga_jual.toLocaleString('id-ID')}</span>
                            <span className="text-[10px] text-muted-foreground">x {item.qty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 rounded" 
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            disabled={isValidatingStock}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-[11px] font-medium">{item.qty}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 rounded" 
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            disabled={isValidatingStock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded text-destructive ml-1" 
                            onClick={() => removeFromCart(item.id)}
                            disabled={isValidatingStock}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={cartEndRef} className="h-1" />
                  </AnimatePresence>
                </div>

                {/* Summary */}
                <div className="shrink-0 border-t border-border p-3 bg-card shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-20">
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-muted-foreground">Diskon</span>
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-24 h-6 text-right text-[12px] py-0 px-2"
                        placeholder="0"
                      />
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Pajak ({taxRate}%)</span>
                        <span className="font-medium">Rp {calculateTax().toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[14px] font-bold pt-1.5 border-t border-border/50 mt-1.5">
                      <span>Total</span>
                      <span className="text-primary">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-10 text-[13px] font-bold shadow-sm" 
                    onClick={handleCheckoutClick}
                    disabled={cart.length === 0 || isValidatingStock}
                  >
                    Bayar Transaksi
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Payment Selection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-h2">Selesaikan Pembayaran</DialogTitle>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 flex justify-between items-center">
              <span className="text-body font-medium">Total Tagihan</span>
              <span className="text-h1 font-bold text-primary">Rp {calculateTotal().toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-small text-muted-foreground">Metode Pembayaran</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih Metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tunai">Uang Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Payment Form based on selection */}
            {paymentType === 'tunai' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <Label className="text-small text-muted-foreground">Jumlah Dibayarkan (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground font-medium">Rp</span>
                    <Input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0"
                      className="pl-9 h-10 text-[14px] font-bold"
                    />
                  </div>
                </div>
                {cashAmount && (
                  <div className="flex justify-between items-center p-2.5 bg-muted rounded-md text-body">
                    <span className="font-medium">Kembalian</span>
                    <span className={`font-bold ${getChangeAmount() < 0 ? 'text-destructive' : 'text-success'}`}>
                      {getChangeAmount() < 0 ? '-' : ''} Rp {Math.abs(getChangeAmount()).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 h-9" onClick={() => setShowPaymentModal(false)}>Batal</Button>
                  <Button 
                    className="flex-1 h-9" 
                    onClick={handleCashPayment}
                    disabled={isProcessing || !cashAmount || parseFloat(cashAmount) < calculateTotal()}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proses Tunai'}
                  </Button>
                </div>
              </div>
            )}

            {paymentType === 'transfer' && (
              <PaymentTransferForm 
                methods={paymentMethods} 
                totalAmount={calculateTotal()}
                onVerify={executePayment}
                onCancel={() => setShowPaymentModal(false)}
              />
            )}

            {paymentType === 'qris' && (
              <PaymentQRISForm 
                method={paymentMethods.find(m => m.tipe_metode === 'qris') || {id: 'qris', nama: 'QRIS Default'}} 
                totalAmount={calculateTotal()}
                onVerify={executePayment}
                onCancel={() => setShowPaymentModal(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBarcodeDetected={handleBarcodeScan}
      />

      <InvoicePrintModal 
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        transaction={lastTransaction}
        storeSettings={storeSettings}
        paymentMethod={usedPaymentMethod}
      />
    </>
  );
};

export default KasirPage;
