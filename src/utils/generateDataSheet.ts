import { ProductItem } from '../types';

export const generateAndPrintDataSheet = (product: ProductItem) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to view and print the technical data sheet.');
    return;
  }

  const specsRows = product.keySpecs
    .map(
      (spec) => `
      <tr style="border-bottom: 1px solid #e2ece7;">
        <td style="padding: 10px 14px; font-weight: 600; color: #164e3d; width: 35%; background: #f8faf9;">${spec.label}</td>
        <td style="padding: 10px 14px; color: #334155; font-family: monospace;">${spec.value}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Technical Data Sheet - ${product.model} - Samstrust Technologies Limited</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #1a2e26;
          background: #ffffff;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #164e3d;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: #164e3d;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 13px;
          color: #ad8921;
          font-weight: 700;
          margin-top: 4px;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
        }
        .product-hero {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
        }
        .product-image {
          width: 240px;
          height: 240px;
          object-fit: cover;
          border: 1px solid #e2ece7;
          border-radius: 12px;
        }
        .product-info {
          flex: 1;
        }
        .model-badge {
          display: inline-block;
          background: #ebf3f0;
          color: #164e3d;
          font-weight: 700;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          font-family: monospace;
          margin-bottom: 8px;
        }
        .product-name {
          font-size: 22px;
          font-weight: 700;
          color: #164e3d;
          margin: 0 0 10px 0;
        }
        .highlight-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 20px 0;
          background: #f4f8f6;
          padding: 16px;
          border-radius: 10px;
        }
        .highlight-item {
          font-size: 12px;
        }
        .highlight-label {
          color: #64748b;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .highlight-val {
          font-weight: 700;
          color: #164e3d;
          font-family: monospace;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 13px;
          border: 1px solid #e2ece7;
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background: #164e3d;
          color: #ffffff;
          padding: 12px 14px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #e2ece7;
          padding-top: 20px;
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #164e3d; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Print / Save PDF
        </button>
      </div>

      <div class="header">
        <div>
          <h1 class="brand-title">SAMSTRUST TECHNOLOGIES LIMITED</h1>
          <div class="brand-subtitle">PRECISION &bull; QUALITY &bull; RELIABILITY | RC 9898142</div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px;">
            Plot 14, Commercial Ave, Ikeja, Lagos &bull; Trans-Amadi, Port Harcourt
          </div>
        </div>
        <div class="meta-box">
          <div>DOCUMENT: TECHNICAL DATA SHEET</div>
          <div>REF: ST-TDS-${product.model}</div>
          <div>DATE: ${new Date().toLocaleDateString('en-GB')}</div>
          <div>ISO/IEC 17025 TRACEABLE</div>
        </div>
      </div>

      <div class="product-hero">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
        <div class="product-info">
          <div class="model-badge">MODEL: ${product.model} &bull; ${product.categoryLabel}</div>
          <h2 class="product-name">${product.name}</h2>
          <p style="font-size: 13px; color: #475569; margin: 0 0 15px 0;">${product.description}</p>
          
          <div class="highlight-grid">
            <div class="highlight-item">
              <div class="highlight-label">Measurement Range</div>
              <div class="highlight-val">${product.measurementRange}</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-label">Accuracy Rating</div>
              <div class="highlight-val">${product.accuracy}</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-label">Standard Compliance</div>
              <div class="highlight-val">${product.compliance}</div>
            </div>
          </div>
        </div>
      </div>

      <h3 style="color: #164e3d; font-size: 16px; border-bottom: 2px solid #e2ece7; padding-bottom: 6px; margin-top: 30px;">
        ENGINEERED TECHNICAL SPECIFICATIONS
      </h3>

      <table>
        <thead>
          <tr>
            <th>Parameter / Attribute</th>
            <th>Engineering Specification</th>
          </tr>
        </thead>
        <tbody>
          ${specsRows}
          <tr style="border-bottom: 1px solid #e2ece7;">
            <td style="padding: 10px 14px; font-weight: 600; color: #164e3d; background: #f8faf9;">Manufacturer / Line</td>
            <td style="padding: 10px 14px; color: #334155; font-family: monospace;">${product.brand}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2ece7;">
            <td style="padding: 10px 14px; font-weight: 600; color: #164e3d; background: #f8faf9;">Standard Lead Time</td>
            <td style="padding: 10px 14px; color: #334155; font-family: monospace;">${product.leadTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #164e3d; background: #f8faf9;">Metrological Traceability</td>
            <td style="padding: 10px 14px; color: #334155; font-family: monospace;">NIST / DKD Traceable Calibration Certificate Included</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>
          <strong>Samstrust Technologies Limited (RC 9898142)</strong><br />
          Web: www.samstrusttech.com &bull; Email: Info@samstrusttech.com &bull; Tel: +234 802 984 4356
        </div>
        <div style="text-align: right;">
          Quality Assurance &amp; Metrology Division<br />
          Official Verified Document
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
