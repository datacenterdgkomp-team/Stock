/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  // Get transaction_id and customer_email from the request context
  const transactionId = e.record.id;
  const customerEmail = e.record.get("customer_email");
  
  // Validate required fields
  if (!transactionId || !customerEmail) {
    console.log("Missing transaction_id or customer_email, skipping invoice email");
    e.next();
    return;
  }

  try {
    // Fetch transaction details
    const transaction = $app.findRecordById("transaksi_penjualan", transactionId);
    if (!transaction) {
      console.log("Transaction not found: " + transactionId);
      e.next();
      return;
    }

    // Fetch store settings
    const storeSettings = $app.findFirstRecordByData("pengaturan_toko", "id", "");
    const storeName = storeSettings ? storeSettings.get("nama_toko") : "Toko";
    const storeAddress = storeSettings ? storeSettings.get("alamat") : "";
    const storePhone = storeSettings ? storeSettings.get("telepon") : "";
    const storeEmail = storeSettings ? storeSettings.get("email") : "";

    // Get transaction details
    const nomorTransaksi = transaction.get("nomor_transaksi");
    const tanggal = transaction.get("tanggal");
    const total = transaction.get("total");
    const pajak = transaction.get("pajak") || 0;
    const metodePembayaran = transaction.get("metode_pembayaran") || "Tunai";
    const items = transaction.get("items") || [];
    const catatan = transaction.get("catatan") || "";

    // Fetch payment method details if not Tunai
    let paymentDetails = "";
    if (metodePembayaran === "Transfer") {
      try {
        const paymentMethod = $app.findFirstRecordByData("payment_methods", "name", "Transfer");
        if (paymentMethod) {
          const bankName = paymentMethod.get("bank_name") || "";
          const accountNumber = paymentMethod.get("account_number") || "";
          const accountHolder = paymentMethod.get("account_holder") || "";
          paymentDetails = "<h3>Bank Transfer Details:</h3>" +
            "<p><strong>Bank:</strong> " + bankName + "</p>" +
            "<p><strong>Account Number:</strong> " + accountNumber + "</p>" +
            "<p><strong>Account Holder:</strong> " + accountHolder + "</p>";
        }
      } catch (err) {
        console.log("Error fetching transfer payment details: " + err.message);
      }
    } else if (metodePembayaran === "Kartu Kredit") {
      paymentDetails = "<h3>Credit Card Payment:</h3>" +
        "<p>Please complete your payment using your credit card.</p>";
    } else if (metodePembayaran === "QRIS") {
      try {
        const paymentMethod = $app.findFirstRecordByData("payment_methods", "name", "QRIS");
        if (paymentMethod) {
          const qrisDescription = paymentMethod.get("qris_description") || "";
          paymentDetails = "<h3>QRIS Payment:</h3>" +
            "<p>" + qrisDescription + "</p>";
        }
      } catch (err) {
        console.log("Error fetching QRIS payment details: " + err.message);
      }
    }

    // Build items table HTML
    let itemsHtml = "<table style='width:100%; border-collapse: collapse; margin: 20px 0;'>" +
      "<tr style='background-color: #f0f0f0;'>" +
      "<th style='border: 1px solid #ddd; padding: 10px; text-align: left;'>Item</th>" +
      "<th style='border: 1px solid #ddd; padding: 10px; text-align: center;'>Qty</th>" +
      "<th style='border: 1px solid #ddd; padding: 10px; text-align: right;'>Price</th>" +
      "<th style='border: 1px solid #ddd; padding: 10px; text-align: right;'>Subtotal</th>" +
      "</tr>";

    if (Array.isArray(items) && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemName = item.nama || item.name || "Item " + (i + 1);
        const qty = item.qty || item.quantity || 0;
        const price = item.harga || item.price || 0;
        const subtotal = qty * price;

        itemsHtml += "<tr>" +
          "<td style='border: 1px solid #ddd; padding: 10px;'>" + itemName + "</td>" +
          "<td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>" + qty + "</td>" +
          "<td style='border: 1px solid #ddd; padding: 10px; text-align: right;'>Rp " + price.toLocaleString("id-ID") + "</td>" +
          "<td style='border: 1px solid #ddd; padding: 10px; text-align: right;'>Rp " + subtotal.toLocaleString("id-ID") + "</td>" +
          "</tr>";
      }
    }

    itemsHtml += "</table>";

    // Calculate subtotal
    const subtotal = total - pajak;

    // Build HTML invoice
    const htmlContent = "<html>" +
      "<head><meta charset='UTF-8'></head>" +
      "<body style='font-family: Arial, sans-serif; color: #333;'>" +
      "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
      
      // Header
      "<div style='text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;'>" +
      "<h1 style='margin: 0; color: #333;'>" + storeName + "</h1>" +
      "<p style='margin: 5px 0; color: #666;'>" + storeAddress + "</p>" +
      "<p style='margin: 5px 0; color: #666;'>Phone: " + storePhone + " | Email: " + storeEmail + "</p>" +
      "</div>" +
      
      // Invoice title and number
      "<h2 style='text-align: center; color: #333;'>INVOICE</h2>" +
      "<p style='text-align: center; font-size: 14px; color: #666;'>Invoice #" + nomorTransaksi + "</p>" +
      
      // Invoice details
      "<div style='margin: 20px 0;'>" +
      "<p><strong>Invoice Date:</strong> " + tanggal + "</p>" +
      "<p><strong>Payment Method:</strong> " + metodePembayaran + "</p>" +
      "</div>" +
      
      // Items table
      "<h3>Order Details:</h3>" +
      itemsHtml +
      
      // Totals
      "<div style='text-align: right; margin: 20px 0;'>" +
      "<p><strong>Subtotal:</strong> Rp " + subtotal.toLocaleString("id-ID") + "</p>" +
      "<p><strong>Tax:</strong> Rp " + pajak.toLocaleString("id-ID") + "</p>" +
      "<p style='font-size: 18px; color: #333;'><strong>Total: Rp " + total.toLocaleString("id-ID") + "</strong></p>" +
      "</div>" +
      
      // Payment details section
      "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
      paymentDetails +
      "</div>" +
      
      // Notes
      (catatan ? "<div style='margin: 20px 0;'><p><strong>Notes:</strong> " + catatan + "</p></div>" : "") +
      
      // Footer
      "<div style='text-align: center; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; color: #666; font-size: 12px;'>" +
      "<p>Thank you for your purchase!</p>" +
      "<p>This is an automated invoice. Please keep it for your records.</p>" +
      "</div>" +
      
      "</div>" +
      "</body>" +
      "</html>";

    // Send email
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: storeName
      },
      to: [{ address: customerEmail }],
      subject: "Invoice #" + nomorTransaksi + " - " + storeName,
      html: htmlContent
    });

    $app.newMailClient().send(message);
    console.log("Invoice email sent successfully to: " + customerEmail);

  } catch (error) {
    console.log("Error sending invoice email: " + error.message);
    // Don't throw error - allow transaction to complete even if email fails
  }

  e.next();
}, "transaksi_penjualan");