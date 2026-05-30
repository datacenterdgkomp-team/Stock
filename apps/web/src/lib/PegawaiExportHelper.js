
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToExcel = (data, filename = 'Data_Pegawai') => {
  const exportData = data.map((item, index) => ({
    'No': index + 1,
    'Nama Lengkap': item.nama_lengkap,
    'Email': item.email,
    'Nomor Telepon': item.nomor_telepon || '-',
    'Posisi': item.posisi || '-',
    'Departemen': item.departemen || '-',
    'Status Kerja': item.status_kerja || '-',
    'Tanggal Bergabung': item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-',
    'Gaji Pokok': item.gaji_pokok || 0,
    'Tunjangan': item.tunjangan || 0,
    'Jenis Kelamin': item.jenis_kelamin || '-',
    'Alamat': item.alamat || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pegawai');
  
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${dateStr}.xlsx`);
};

export const exportToPDF = async (data, filename = 'Data_Pegawai') => {
  // Create a hidden table for html2canvas to render
  const tableContainer = document.createElement('div');
  tableContainer.style.position = 'absolute';
  tableContainer.style.left = '-9999px';
  tableContainer.style.top = '-9999px';
  tableContainer.style.width = '1200px';
  tableContainer.style.backgroundColor = '#ffffff';
  tableContainer.style.padding = '20px';
  tableContainer.style.fontFamily = 'sans-serif';

  const dateStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  let tableHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #1e40af;">Laporan Data Pegawai</h2>
      <p style="margin: 5px 0 0 0; color: #64748b;">Dicetak pada: ${dateStr}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left;">
          <th style="border: 1px solid #cbd5e1; padding: 8px;">No</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Nama Lengkap</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Email</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Posisi</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Departemen</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Status</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Telepon</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px;">Tgl Bergabung</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((item, index) => {
    tableHTML += `
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.nama_lengkap}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.email}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.posisi || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.departemen || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.status_kerja || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.nomor_telepon || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHTML;
  document.body.appendChild(tableContainer);

  try {
    const canvas = await html2canvas(tableContainer, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(tableContainer);
  }
};
