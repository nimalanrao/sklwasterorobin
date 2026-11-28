import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

async function createStyledExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SKL Waste Sdn Bhd';
  workbook.lastModifiedBy = 'SKL Waste RoRo Fleet System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Brand Colors
  const COLOR_BRAND_GREEN = '15803D'; // SKL Primary Emerald
  const COLOR_DARK_HEADER = '0F172A'; // Deep Navy Slate
  const COLOR_THIRUMAL_AMBER = 'D97706'; // Thirumal Amber
  const COLOR_ZEBRA_LIGHT = 'F8FAFC'; // Soft Slate zebra
  const COLOR_BORDER = 'CBD5E1'; // Light slate border
  const COLOR_ACTIVE_BG = 'DCFCE7'; // Soft Green badge
  const COLOR_ACTIVE_TXT = '166534';
  const COLOR_OVERDUE_BG = 'FEE2E2'; // Soft Red badge
  const COLOR_OVERDUE_TXT = '991B1B';
  const COLOR_COMPLETED_BG = 'F1F5F9'; // Soft Slate badge
  const COLOR_COMPLETED_TXT = '475569';

  // -------------------------------------------------------------
  // SHEET 1: ACTIVE & PENDING FLEET
  // -------------------------------------------------------------
  const wsActive = workbook.addWorksheet('Active RoRo Fleet', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Title Banner
  wsActive.mergeCells('A1:J1');
  const titleCell = wsActive.getCell('A1');
  titleCell.value = 'SKL WASTE SDN BHD — ACTIVE RORO FLEET REGISTER';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_DARK_HEADER } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsActive.getRow(1).height = 34;

  // Subtitle / Metadata Row
  wsActive.mergeCells('A2:J2');
  const subCell = wsActive.getCell('A2');
  subCell.value = `Live Fleet Status & Rental Tracker • Generated: ${new Date().toLocaleDateString('en-GB')} • Direct Dispatch & Monitoring`;
  subCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsActive.getRow(2).height = 20;

  // Blank spacer row
  wsActive.getRow(3).height = 8;

  // Column Headers
  const activeHeaders = [
    'No',
    'INV #',
    'Bin Owner / Company',
    'Bin Size',
    'Delivery Location / Tapak',
    'Customer Name',
    'Phone Contact',
    'Start Date',
    'End Date',
    'Rental Fee (RM)'
  ];

  const headerRow4 = wsActive.getRow(4);
  headerRow4.values = activeHeaders;
  headerRow4.height = 28;
  headerRow4.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BRAND_GREEN } };
    cell.alignment = { vertical: 'middle', horizontal: colNum === 1 || colNum === 2 || colNum === 4 || colNum === 8 || colNum === 9 ? 'center' : (colNum === 10 ? 'right' : 'left'), wrapText: false };
    cell.border = {
      top: { style: 'medium', color: { argb: '0E5A2B' } },
      bottom: { style: 'medium', color: { argb: '0E5A2B' } },
      left: { style: 'thin', color: { argb: '4ADE80' } },
      right: { style: 'thin', color: { argb: '4ADE80' } }
    };
  });

  // Sample production fleet records
  const sampleActiveRecords = [
    { no: 1, inv: '0749', owner: 'SKL Waste', size: '2 Feet', loc: 'No 11A, Jalan BSC 2C, Bandar Seri Coalfields, 47000 Sungai Buloh', cust: 'Mr. David Tan', phone: '+60 14-274 8314', start: '2026-11-23', end: '2026-12-02', price: 200 },
    { no: 2, inv: '0750', owner: 'SKL Waste', size: '4 Feet', loc: 'Seksyen 7, Shah Alam (Bungalow Renovation Site)', cust: 'Mr. Yusof (Contractor)', phone: '+60 12-345 6789', start: '2026-11-20', end: '2026-11-30', price: 350 },
    { no: 3, inv: '0751', owner: 'Thirumal Vel Enterprise', size: '2 Feet', loc: 'Lot 4022, Jalan Welfare, Kampung Baru Sungai Buloh', cust: 'Tiviya', phone: '+60 17-694 7413', start: '2026-11-24', end: '2026-12-04', price: 240 },
    { no: 4, inv: '0752', owner: 'SKL Waste', size: '4 Feet', loc: 'Jalan Nautika U20/20, Pusat Komersial TSB, Sungai Buloh', cust: 'Puan Siti Aminah', phone: '+60 19-882 1455', start: '2026-11-21', end: '2026-12-01', price: 380 },
    { no: 5, inv: '0753', owner: 'SKL Waste', size: '2 Feet', loc: 'No 45, Jalan Eco Grandeur 1/3, Eco Grandeur, Puncak Alam', cust: 'En. Razak', phone: '+60 13-902 4411', start: '2026-11-25', end: '2026-12-05', price: 220 },
    { no: 6, inv: '0754', owner: 'Thirumal Vel Enterprise', size: '4 Feet', loc: 'Jalan Bukit Rahman Putra 1/2, Bukit Rahman Putra, 47000 Sungai Buloh', cust: 'Tiviya', phone: '+60 17-694 7413', start: '2026-11-19', end: '2026-11-29', price: 360 },
    { no: 7, inv: '0755', owner: 'SKL Waste', size: '4 Feet', loc: 'Bukit Jelutong Industrial Park, Seksyen U8, Shah Alam', cust: 'Madam Halimah', phone: '+60 16-615 9365', start: '2026-11-15', end: '2026-11-25', price: 400 },
    { no: 8, inv: '0756', owner: 'SKL Waste', size: '2 Feet', loc: 'Jalan Meru Utama 2, Pekan Meru, 41050 Klang', cust: 'Ah Seng Hardware', phone: '+60 12-771 9022', start: '2026-11-22', end: '2026-12-02', price: 210 },
    { no: 9, inv: '0757', owner: 'Thirumal Vel Enterprise', size: '2 Feet', loc: 'Taman Desa Aman, Ijok, Selangor', cust: 'Tiviya', phone: '+60 17-694 7413', start: '2026-11-26', end: '2026-12-06', price: 230 }
  ];

  let activeStartRow = 5;
  sampleActiveRecords.forEach((rec, idx) => {
    const rowIdx = activeStartRow + idx;
    const row = wsActive.getRow(rowIdx);
    row.values = [
      rec.no,
      rec.inv,
      rec.owner,
      rec.size,
      rec.loc,
      rec.cust,
      rec.phone,
      rec.start,
      rec.end,
      rec.price
    ];
    row.height = 22;

    const isEven = idx % 2 === 1;
    const bg = isEven ? COLOR_ZEBRA_LIGHT : 'FFFFFFFF';

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        top: { style: 'thin', color: { argb: COLOR_BORDER } },
        bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
        left: { style: 'thin', color: { argb: COLOR_BORDER } },
        right: { style: 'thin', color: { argb: COLOR_BORDER } }
      };

      if (colNum === 1 || colNum === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (colNum === 2) cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF334155' } };
      } else if (colNum === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        if (rec.owner.includes('Thirumal')) {
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFB45309' } };
        } else {
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF15803D' } };
        }
      } else if (colNum === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: rec.size === '4 Feet' ? 'FF6B21A8' : 'FF1D4ED8' } };
      } else if (colNum === 8 || colNum === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = 'yyyy-mm-dd';
      } else if (colNum === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '"RM "#,##0.00';
        cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  const activeEndRow = activeStartRow + sampleActiveRecords.length - 1;
  const totalRowIdx = activeEndRow + 1;
  const totalRow = wsActive.getRow(totalRowIdx);
  totalRow.getCell(1).value = '';
  totalRow.getCell(2).value = '';
  totalRow.getCell(3).value = 'TOTAL ACTIVE FLEET';
  totalRow.getCell(4).value = { formula: `COUNTA(D${activeStartRow}:D${activeEndRow}) & " Bins"` };
  totalRow.getCell(10).value = { formula: `SUM(J${activeStartRow}:J${activeEndRow})` };

  totalRow.height = 26;
  totalRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = {
      top: { style: 'medium', color: { argb: '94A3B8' } },
      bottom: { style: 'double', color: { argb: '475569' } },
      left: { style: 'thin', color: { argb: COLOR_BORDER } },
      right: { style: 'thin', color: { argb: COLOR_BORDER } }
    };
    if (colNum === 10) {
      cell.numFmt = '"RM "#,##0.00';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
    } else if (colNum === 4) {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  // Column Widths for Active Sheet (Comfortably spaced, no truncation)
  wsActive.getColumn(1).width = 7;   // No
  wsActive.getColumn(2).width = 11;  // INV #
  wsActive.getColumn(3).width = 26;  // Bin Owner
  wsActive.getColumn(4).width = 14;  // Size
  wsActive.getColumn(5).width = 54;  // Location
  wsActive.getColumn(6).width = 24;  // Customer Name
  wsActive.getColumn(7).width = 19;  // Phone Contact
  wsActive.getColumn(8).width = 15;  // Start Date
  wsActive.getColumn(9).width = 15;  // End Date
  wsActive.getColumn(10).width = 18; // Rental Fee

  // -------------------------------------------------------------
  // SHEET 2: COMPLETED & PULLED BINS
  // -------------------------------------------------------------
  const wsCompleted = workbook.addWorksheet('Completed Bins History', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  wsCompleted.mergeCells('A1:J1');
  const compTitle = wsCompleted.getCell('A1');
  compTitle.value = 'SKL WASTE SDN BHD — COMPLETED / PULLED BINS ARCHIVE';
  compTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  compTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
  compTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsCompleted.getRow(1).height = 34;

  wsCompleted.mergeCells('A2:J2');
  const compSub = wsCompleted.getCell('A2');
  compSub.value = 'Archived records of successfully pulled or replaced (tukar) bins with recorded revenue';
  compSub.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
  compSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  compSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsCompleted.getRow(2).height = 20;
  wsCompleted.getRow(3).height = 8;

  const compHeaders = [
    'No',
    'INV #',
    'Bin Owner / Company',
    'Bin Size',
    'Delivery Location',
    'Customer Name',
    'Completed Action',
    'Start Date',
    'Date Pulled',
    'Rental Fee (RM)'
  ];

  const headerRowComp = wsCompleted.getRow(4);
  headerRowComp.values = compHeaders;
  headerRowComp.height = 28;
  headerRowComp.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: colNum === 1 || colNum === 2 || colNum === 4 || colNum === 7 || colNum === 8 || colNum === 9 ? 'center' : (colNum === 10 ? 'right' : 'left') };
    cell.border = {
      top: { style: 'medium', color: { argb: '0F172A' } },
      bottom: { style: 'medium', color: { argb: '0F172A' } }
    };
  });

  const sampleCompRecords = [
    { no: 1, inv: '0738', owner: 'SKL Waste', size: '2 Feet', loc: 'Jalan Bukit Cerakah, Meru, Klang', cust: 'Tan Ah Kow', action: 'Tarik Tong (Selesai)', start: '2026-11-05', pulled: '2026-11-15', price: 200 },
    { no: 2, inv: '0739', owner: 'SKL Waste', size: '4 Feet', loc: 'Taman Subang Perdana, Seksyen U3, Shah Alam', cust: 'Mega Build Enterprise', action: 'Tukar Tong (Ganti Baru)', start: '2026-11-08', pulled: '2026-11-18', price: 380 },
    { no: 3, inv: '0740', owner: 'Thirumal Vel Enterprise', size: '2 Feet', loc: 'Bandar Baru Kundang, Rawang', cust: 'Tiviya', action: 'Tarik Tong (Selesai)', start: '2026-11-02', pulled: '2026-11-12', price: 240 },
    { no: 4, inv: '0741', owner: 'SKL Waste', size: '4 Feet', loc: 'Jalan Industri USJ 1/3, Subang Jaya', cust: 'Klinik Kesihatan Subang', action: 'Tarik Tong (Selesai)', start: '2026-11-06', pulled: '2026-11-16', price: 350 },
    { no: 5, inv: '0742', owner: 'SKL Waste', size: '2 Feet', loc: 'Saujana Utama 3, Sungai Buloh', cust: 'En. Firdaus', action: 'Tarik Tong (Selesai)', start: '2026-11-10', pulled: '2026-11-20', price: 220 }
  ];

  const compStartRow = 5;
  sampleCompRecords.forEach((rec, idx) => {
    const rowIdx = compStartRow + idx;
    const row = wsCompleted.getRow(rowIdx);
    row.values = [
      rec.no,
      rec.inv,
      rec.owner,
      rec.size,
      rec.loc,
      rec.cust,
      rec.action,
      rec.start,
      rec.pulled,
      rec.price
    ];
    row.height = 22;
    const bg = idx % 2 === 1 ? COLOR_ZEBRA_LIGHT : 'FFFFFFFF';

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        top: { style: 'thin', color: { argb: COLOR_BORDER } },
        bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
        left: { style: 'thin', color: { argb: COLOR_BORDER } },
        right: { style: 'thin', color: { argb: COLOR_BORDER } }
      };

      if (colNum === 1 || colNum === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNum === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNum === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: rec.action.includes('Tukar') ? 'FFB45309' : 'FF15803D' } };
      } else if (colNum === 8 || colNum === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = 'yyyy-mm-dd';
      } else if (colNum === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '"RM "#,##0.00';
        cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  const compEndRow = compStartRow + sampleCompRecords.length - 1;
  const compTotalRow = wsCompleted.getRow(compEndRow + 1);
  compTotalRow.getCell(3).value = 'TOTAL COMPLETED REVENUE';
  compTotalRow.getCell(4).value = { formula: `COUNTA(D${compStartRow}:D${compEndRow}) & " Bins"` };
  compTotalRow.getCell(10).value = { formula: `SUM(J${compStartRow}:J${compEndRow})` };
  compTotalRow.height = 26;
  compTotalRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = {
      top: { style: 'medium', color: { argb: '94A3B8' } },
      bottom: { style: 'double', color: { argb: '475569' } },
      left: { style: 'thin', color: { argb: COLOR_BORDER } },
      right: { style: 'thin', color: { argb: COLOR_BORDER } }
    };
    if (colNum === 10) {
      cell.numFmt = '"RM "#,##0.00';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
    } else if (colNum === 4) {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  wsCompleted.getColumn(1).width = 7;
  wsCompleted.getColumn(2).width = 11;
  wsCompleted.getColumn(3).width = 26;
  wsCompleted.getColumn(4).width = 14;
  wsCompleted.getColumn(5).width = 54;
  wsCompleted.getColumn(6).width = 24;
  wsCompleted.getColumn(7).width = 24;
  wsCompleted.getColumn(8).width = 15;
  wsCompleted.getColumn(9).width = 15;
  wsCompleted.getColumn(10).width = 18;

  // -------------------------------------------------------------
  // SHEET 3: FLEET & FINANCIAL EXECUTIVE SUMMARY
  // -------------------------------------------------------------
  const wsSummary = workbook.addWorksheet('Executive Summary', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  wsSummary.mergeCells('A1:F1');
  const sumTitle = wsSummary.getCell('A1');
  sumTitle.value = 'SKL WASTE SDN BHD — FLEET & REVENUE EXECUTIVE KPI';
  sumTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  sumTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BRAND_GREEN } };
  sumTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsSummary.getRow(1).height = 34;

  wsSummary.mergeCells('A2:F2');
  const sumSub = wsSummary.getCell('A2');
  sumSub.value = 'Dynamic cross-sheet reconciliation between active and pulled bins';
  sumSub.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
  sumSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  sumSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsSummary.getRow(2).height = 20;
  wsSummary.getRow(3).height = 12;

  // Table 1: Company / Owner Breakdown
  wsSummary.mergeCells('A4:D4');
  const tbl1Header = wsSummary.getCell('A4');
  tbl1Header.value = '1. BREAKDOWN BY BIN OWNER';
  tbl1Header.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  wsSummary.getRow(4).height = 22;

  const ownerHeaders = ['Company / Entity', 'Active Bins', 'Completed Bins', 'Total Revenue (RM)'];
  const row5 = wsSummary.getRow(5);
  row5.values = ownerHeaders;
  row5.height = 26;
  row5.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
    cell.alignment = { vertical: 'middle', horizontal: colNum === 1 ? 'left' : (colNum === 4 ? 'right' : 'center') };
  });

  // Row 6: SKL Waste
  const row6 = wsSummary.getRow(6);
  row6.values = [
    'SKL Waste Sdn Bhd',
    { formula: `COUNTIF('Active RoRo Fleet'!C5:C13, "*SKL Waste*")` },
    { formula: `COUNTIF('Completed Bins History'!C5:C9, "*SKL Waste*")` },
    { formula: `SUMIF('Active RoRo Fleet'!C5:C13, "*SKL Waste*", 'Active RoRo Fleet'!J5:J13) + SUMIF('Completed Bins History'!C5:C9, "*SKL Waste*", 'Completed Bins History'!J5:J9)` }
  ];
  row6.height = 24;

  // Row 7: Thirumal Vel Enterprise
  const row7 = wsSummary.getRow(7);
  row7.values = [
    'Thirumal Vel Enterprise',
    { formula: `COUNTIF('Active RoRo Fleet'!C5:C13, "*Thirumal*")` },
    { formula: `COUNTIF('Completed Bins History'!C5:C9, "*Thirumal*")` },
    { formula: `SUMIF('Active RoRo Fleet'!C5:C13, "*Thirumal*", 'Active RoRo Fleet'!J5:J13) + SUMIF('Completed Bins History'!C5:C9, "*Thirumal*", 'Completed Bins History'!J5:J9)` }
  ];
  row7.height = 24;

  // Row 8: Total
  const row8 = wsSummary.getRow(8);
  row8.values = [
    'TOTAL OVERALL',
    { formula: `SUM(B6:B7)` },
    { formula: `SUM(C6:C7)` },
    { formula: `SUM(D6:D7)` }
  ];
  row8.height = 26;

  [row6, row7, row8].forEach((r, idx) => {
    const isTotal = idx === 2;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, bold: isTotal, color: { argb: isTotal ? 'FF0F172A' : (colNum === 1 && idx === 1 ? 'FFB45309' : (colNum === 1 && idx === 0 ? 'FF15803D' : 'FF0F172A')) } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isTotal ? 'FFE2E8F0' : (idx % 2 === 1 ? COLOR_ZEBRA_LIGHT : 'FFFFFFFF') } };
      cell.border = {
        top: { style: isTotal ? 'medium' : 'thin', color: { argb: isTotal ? '94A3B8' : COLOR_BORDER } },
        bottom: { style: isTotal ? 'double' : 'thin', color: { argb: isTotal ? '475569' : COLOR_BORDER } },
        left: { style: 'thin', color: { argb: COLOR_BORDER } },
        right: { style: 'thin', color: { argb: COLOR_BORDER } }
      };
      if (colNum === 2 || colNum === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNum === 4) {
        cell.numFmt = '"RM "#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (isTotal) cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // Table 2: Bin Size Breakdown
  wsSummary.getRow(10).height = 14; // spacer
  wsSummary.mergeCells('A11:D11');
  const tbl2Header = wsSummary.getCell('A11');
  tbl2Header.value = '2. BREAKDOWN BY BIN SPECIFICATION (SIZE)';
  tbl2Header.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  wsSummary.getRow(11).height = 22;

  const sizeHeaders = ['Bin Size Category', 'Active Fleet', 'Completed Units', 'Total Value (RM)'];
  const row12 = wsSummary.getRow(12);
  row12.values = sizeHeaders;
  row12.height = 26;
  row12.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: colNum === 1 ? 'left' : (colNum === 4 ? 'right' : 'center') };
  });

  const row13 = wsSummary.getRow(13);
  row13.values = [
    '2 Feet (Standard Renovation & Heavy Waste)',
    { formula: `COUNTIF('Active RoRo Fleet'!D5:D13, "*2 Feet*")` },
    { formula: `COUNTIF('Completed Bins History'!D5:D9, "*2 Feet*")` },
    { formula: `SUMIF('Active RoRo Fleet'!D5:D13, "*2 Feet*", 'Active RoRo Fleet'!J5:J13) + SUMIF('Completed Bins History'!D5:D9, "*2 Feet*", 'Completed Bins History'!J5:J9)` }
  ];
  row13.height = 24;

  const row14 = wsSummary.getRow(14);
  row14.values = [
    '4 Feet (Bulky / Commercial / Construction Waste)',
    { formula: `COUNTIF('Active RoRo Fleet'!D5:D13, "*4 Feet*")` },
    { formula: `COUNTIF('Completed Bins History'!D5:D9, "*4 Feet*")` },
    { formula: `SUMIF('Active RoRo Fleet'!D5:D13, "*4 Feet*", 'Active RoRo Fleet'!J5:J13) + SUMIF('Completed Bins History'!D5:D9, "*4 Feet*", 'Completed Bins History'!J5:J9)` }
  ];
  row14.height = 24;

  const row15 = wsSummary.getRow(15);
  row15.values = [
    'TOTAL FLEET ASSETS',
    { formula: `SUM(B13:B14)` },
    { formula: `SUM(C13:C14)` },
    { formula: `SUM(D13:D14)` }
  ];
  row15.height = 26;

  [row13, row14, row15].forEach((r, idx) => {
    const isTotal = idx === 2;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, bold: isTotal, color: { argb: isTotal ? 'FF0F172A' : 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isTotal ? 'FFE2E8F0' : (idx % 2 === 1 ? COLOR_ZEBRA_LIGHT : 'FFFFFFFF') } };
      cell.border = {
        top: { style: isTotal ? 'medium' : 'thin', color: { argb: isTotal ? '94A3B8' : COLOR_BORDER } },
        bottom: { style: isTotal ? 'double' : 'thin', color: { argb: isTotal ? '475569' : COLOR_BORDER } },
        left: { style: 'thin', color: { argb: COLOR_BORDER } },
        right: { style: 'thin', color: { argb: COLOR_BORDER } }
      };
      if (colNum === 2 || colNum === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNum === 4) {
        cell.numFmt = '"RM "#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (isTotal) cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  wsSummary.getColumn(1).width = 46;
  wsSummary.getColumn(2).width = 18;
  wsSummary.getColumn(3).width = 20;
  wsSummary.getColumn(4).width = 24;

  // Save to root and public directories
  const rootPath = path.resolve('./SKL_Waste_RoRo_Fleet_Management.xlsx');
  const publicPath = path.resolve('./public/SKL_Waste_RoRo_Fleet_Management.xlsx');

  await workbook.xlsx.writeFile(rootPath);
  await workbook.xlsx.writeFile(publicPath);

  console.log(`Excel file created successfully:`);
  console.log(`- Root: ${rootPath}`);
  console.log(`- Public: ${publicPath}`);
}

createStyledExcel().catch(console.error);
