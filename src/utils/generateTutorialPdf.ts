/**
 * Samstrust Technologies Limited (RC 9898142)
 * Platform Operational & User Guide PDF Generator
 * Document Ref: SOP-STM-2026-TUTORIAL-V1
 */

export const generateAndPrintTutorialPdf = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert(
      'Popup blocked! Please allow popups in your browser to view and download the official Samstrust Technologies Platform User Guide PDF.'
    );
    return;
  }

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Platform Operational Guide & Tutorial - Samstrust Technologies Limited (RC 9898142)</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 16mm 20mm 16mm;
          @bottom-right {
            content: "Page " counter(page);
            font-size: 9pt;
            color: #64748b;
            font-family: Arial, sans-serif;
          }
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 24px 32px;
          color: #1a2e26;
          background: #ffffff;
          line-height: 1.55;
          font-size: 13px;
        }

        /* Cover & Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #164e3d;
          padding-bottom: 18px;
          margin-bottom: 24px;
        }

        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: #164e3d;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          font-size: 12px;
          color: #c5a059;
          font-weight: 700;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #475569;
          font-family: monospace;
          background: #f4f8f6;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #e2ece7;
        }

        /* Document Title Banner */
        .doc-banner {
          background: linear-gradient(135deg, #164e3d 0%, #0e3529 100%);
          color: #ffffff;
          padding: 22px 26px;
          border-radius: 8px;
          margin-bottom: 26px;
          border-left: 6px solid #d4af37;
        }

        .doc-banner h1 {
          margin: 0 0 6px 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .doc-banner p {
          margin: 0;
          font-size: 13px;
          color: #d1fae5;
          max-width: 680px;
        }

        .doc-meta-pills {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          font-size: 11px;
          font-family: monospace;
        }

        .doc-meta-pills span {
          background: rgba(255, 255, 255, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
          color: #fef3c7;
        }

        /* Chapter Headings */
        h2 {
          color: #164e3d;
          font-size: 16px;
          font-weight: 700;
          margin: 28px 0 12px 0;
          padding-bottom: 6px;
          border-bottom: 1.5px solid #d4af37;
          display: flex;
          align-items: center;
          gap: 8px;
          page-break-after: avoid;
        }

        h3 {
          color: #0e3529;
          font-size: 14px;
          font-weight: 600;
          margin: 16px 0 8px 0;
          page-break-after: avoid;
        }

        p, li {
          color: #334155;
          margin: 0 0 8px 0;
        }

        ul, ol {
          margin: 0 0 14px 0;
          padding-left: 22px;
        }

        li {
          margin-bottom: 6px;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0 20px 0;
          font-size: 12px;
          page-break-inside: avoid;
        }

        th {
          background: #164e3d;
          color: #ffffff;
          padding: 8px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2ece7;
          color: #334155;
        }

        tr:nth-child(even) td {
          background: #f8faf9;
        }

        /* Callout Boxes */
        .callout {
          background: #f4f8f6;
          border-left: 4px solid #164e3d;
          padding: 12px 16px;
          border-radius: 0 6px 6px 0;
          margin: 14px 0;
          font-size: 12px;
          page-break-inside: avoid;
        }

        .callout-gold {
          background: #fffbeb;
          border-left: 4px solid #d4af37;
        }

        .callout-title {
          font-weight: 700;
          color: #164e3d;
          margin-bottom: 4px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .callout-gold .callout-title {
          color: #92400e;
        }

        /* Step Badge */
        .step-badge {
          display: inline-block;
          background: #164e3d;
          color: #ffffff;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          margin-right: 6px;
        }

        .badge-gold {
          background: #d4af37;
          color: #0e3529;
        }

        /* Code snippets */
        code {
          font-family: 'Courier New', Courier, monospace;
          background: #f1f5f9;
          padding: 2px 5px;
          border-radius: 4px;
          color: #0f172a;
          font-size: 11px;
        }

        /* Page break utilities */
        .page-break {
          page-break-before: always;
        }

        /* Print Action Header */
        .no-print-bar {
          background: #164e3d;
          color: white;
          padding: 14px 20px;
          margin: -24px -32px 24px -32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #d4af37;
        }

        .btn-print {
          background: #d4af37;
          color: #0e3529;
          border: none;
          padding: 8px 18px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }

        .btn-print:hover {
          background: #fef08a;
        }

        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            padding: 0;
            background: white;
          }
        }
      </style>
    </head>
    <body>
      <!-- Top Interactive Bar (Hidden when printed to PDF) -->
      <div class="no-print-bar">
        <div>
          <strong>Samstrust Technologies Limited &bull; Operational Documentation</strong>
          <span style="opacity: 0.8; font-size: 12px; margin-left: 10px;">Select "Save as PDF" in your print destination</span>
        </div>
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>

      <!-- Corporate Header -->
      <div class="header">
        <div>
          <div class="brand-title">SAMSTRUST TECHNOLOGIES LIMITED</div>
          <div class="brand-subtitle">Precision &bull; Quality &bull; Reliability &bull; ISO/IEC 17025 Accredited</div>
        </div>
        <div class="meta-box">
          <div><strong>CAC RC:</strong> 9898142</div>
          <div><strong>DOC REF:</strong> SOP-STM-2026-TUTORIAL-V1</div>
          <div><strong>VERSION:</strong> 2.4.0 (Full Suite)</div>
          <div><strong>DATE:</strong> ${generatedDate}</div>
        </div>
      </div>

      <!-- Document Banner -->
      <div class="doc-banner">
        <h1>PLATFORM OPERATIONAL MANUAL & WORKFLOW GUIDE</h1>
        <p>Complete step-by-step user and administrative guide for the Samstrust Technologies digital platform, covering the multi-step RFQ engine, equipment catalog, ISO 17025 calibration booking, and the full CMS backend.</p>
        <div class="doc-meta-pills">
          <span>PORTAL: Public &amp; Administrative</span>
          <span>AUTHORITY: Technical Operations</span>
          <span>STATUS: Verified Production</span>
        </div>
      </div>

      <!-- Table of Contents -->
      <h2>1. TABLE OF CONTENTS</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Section</th>
            <th style="width: 45%;">Module / Workflow</th>
            <th style="width: 40%;">Primary Target Audience</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Section 2</strong></td>
            <td>System Overview &amp; Navigation Architecture</td>
            <td>All Users, Sales, Marketing &amp; Technical Staff</td>
          </tr>
          <tr>
            <td><strong>Section 3</strong></td>
            <td>Public Product Catalog, Multi-Currency &amp; Data Sheets</td>
            <td>Clients, Procurement Officers, Project Engineers</td>
          </tr>
          <tr>
            <td><strong>Section 4</strong></td>
            <td>ISO/IEC 17025 Calibration &amp; Metrology Service Booking</td>
            <td>QA/QC Managers, Plant Engineers, Lab Directors</td>
          </tr>
          <tr>
            <td><strong>Section 5</strong></td>
            <td>4-Step Request for Quotation (RFQ) Engine &amp; Tracking</td>
            <td>Procurement Teams, Bidders, Enterprise Buyers</td>
          </tr>
          <tr>
            <td><strong>Section 6</strong></td>
            <td>Administrative CMS: Authentication &amp; RBAC Personas</td>
            <td>Super Admins, Marketing Editors, Sales Reviewers</td>
          </tr>
          <tr>
            <td><strong>Section 7</strong></td>
            <td>CMS Modules: Hero Slider, Catalog &amp; Services/FAQ</td>
            <td>Marketing Team &amp; Technical Content Authors</td>
          </tr>
          <tr>
            <td><strong>Section 8</strong></td>
            <td>Lead &amp; RFQ Pipeline: Triage, Status &amp; CSV Export</td>
            <td>Sales Operations, Account Managers, Finance</td>
          </tr>
          <tr>
            <td><strong>Section 9</strong></td>
            <td>Troubleshooting, Contact Coordinates &amp; Escalation</td>
            <td>Technical Support &amp; System Administrators</td>
          </tr>
        </tbody>
      </table>

      <!-- Section 2 -->
      <h2>2. SYSTEM OVERVIEW &amp; NAVIGATION ARCHITECTURE</h2>
      <p>The Samstrust Technologies Limited digital ecosystem consists of two interconnected environments built on high-performance React and Vite architecture:</p>
      <ol>
        <li><strong>Public Corporate Portal (Frontend):</strong> Responsive interface showcasing precision measurement instruments, oil &amp; gas meters, industrial laboratory equipment, cleanroom consumables, and ISO 17025 field metrology services. Accessible 24/7 with zero authentication required.</li>
        <li><strong>Administrative CMS Portal (/admin):</strong> Role-Protected Content Management System and Sales Pipeline hub providing total control over homepage sliders, product catalog, technical specifications, service scopes, FAQs, and inbound lead triage without writing code.</li>
      </ol>

      <div class="callout">
        <div class="callout-title">Global Top Utility Bar (Public Header)</div>
        <p>The top emerald utility bar includes verified corporate credentials (<strong>CAC RC: 9898142</strong>), immediate telephone dialer (<strong>+234 802 984 4356</strong>), official email, live multi-currency switcher (<strong>NGN ₦</strong>, <strong>USD $</strong>, <strong>EUR €</strong>, <strong>GBP £</strong>), and the active RFQ Cart counter.</p>
      </div>

      <!-- Section 3 -->
      <div class="page-break"></div>
      <h2>3. PUBLIC PRODUCT CATALOG, MULTI-CURRENCY &amp; DATA SHEETS</h2>
      <p>The digital catalog provides structured access to Samstrust's inventory across 6 primary categories: <em>Analytical Laboratory Equipment</em>, <em>Flow &amp; Pressure Instrumentation</em>, <em>Process Metrology</em>, <em>Cleanroom Consumables</em>, <em>Environmental Testing</em>, and <em>Safety &amp; Calibration Standards</em>.</p>

      <h3>Step-by-Step Catalog Workflow:</h3>
      <ol>
        <li><span class="step-badge">1</span> <strong>Filter &amp; Search:</strong> Click <strong>Products</strong> on the navigation menu. Use the search input to filter by SKU, model name, or manufacturer (e.g., <em>Endress+Hauser, Mettler Toledo, Anton Paar, Sartorius</em>). Filter by category or lead-time status.</li>
        <li><span class="step-badge">2</span> <strong>Currency Switcher:</strong> Switch currency via the top-bar dropdown. Pricing dynamically updates according to real-time corporate conversion benchmarks.</li>
        <li><span class="step-badge">3</span> <strong>Product Detail Page (Modal):</strong> Click any product card to view multi-angle photos, complete operational specifications, compliance standards (ATEX, IECEx, ISO 17025), and delivery timelines.</li>
        <li><span class="step-badge">4</span> <strong>Technical Data Sheet Generation:</strong> Click <strong>"Download Technical Data Sheet (PDF)"</strong> inside the modal. The system instantly compiles a branded, print-ready engineering spec sheet with tolerances and QR authentication.</li>
        <li><span class="step-badge">5</span> <strong>Add to RFQ Cart:</strong> Click <strong>"Add to RFQ Dossier"</strong>. The global header counter updates automatically. You can add multiple items across categories before submitting.</li>
      </ol>

      <!-- Section 4 -->
      <h2>4. ISO/IEC 17025 CALIBRATION &amp; METROLOGY SERVICE BOOKING</h2>
      <p>Samstrust operates a full-scale metrology laboratory and mobile field calibration fleet covering temperature, pressure, electrical, mass, and volumetric liquid meters.</p>

      <h3>How to Book a Service:</h3>
      <ol>
        <li><span class="step-badge">1</span> Navigate to <strong>Services</strong> in the main header.</li>
        <li><span class="step-badge">2</span> Review the service scopes (e.g., <em>Coriolis &amp; Turbine Meter Calibration</em>, <em>Cleanroom Environmental Validation</em>, <em>Preventive Maintenance Contracts</em>).</li>
        <li><span class="step-badge">3</span> Select between <strong>On-Site Field Metrology</strong> (mobile van dispatched to your plant) or <strong>In-Lab Depot Calibration</strong>.</li>
        <li><span class="step-badge">4</span> Fill out the booking dialog: equipment type, calibration interval, serial numbers, facility location (e.g., Lagos, Port Harcourt, Warri, Kaduna), and desired target date.</li>
        <li><span class="step-badge">5</span> Submit the request. A confirmation is immediately issued, and a high-priority service lead is automatically injected into the <strong>CMS Lead Pipeline</strong> with the tag <code>Service Inquiry</code>.</li>
      </ol>

      <!-- Section 5 -->
      <div class="page-break"></div>
      <h2>5. 4-STEP REQUEST FOR QUOTATION (RFQ) ENGINE</h2>
      <p>The multi-step RFQ engine allows prospective corporate clients and EPC contractors to submit official tenders and quotations with full compliance parameters.</p>

      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Title</th>
            <th>Required Information &amp; Technical Capabilities</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Step 1</strong></td>
            <td>Company &amp; Contact Details</td>
            <td>
              Corporate entity name, CAC RC or Tax Identification Number (TIN), Lead Contact Name, Official Corporate Email, Direct Phone (+234), and Delivery State/Address across Nigeria.
            </td>
          </tr>
          <tr>
            <td><strong>Step 2</strong></td>
            <td>Item Selection &amp; Scope</td>
            <td>
              Select items pre-loaded from the catalog cart or add custom line items. Specify exact quantities, model numbers, tolerance ratings (e.g., &plusmn;0.1% o.r.), and process media requirements.
            </td>
          </tr>
          <tr>
            <td><strong>Step 3</strong></td>
            <td>Auxiliary Engineering Services</td>
            <td>
              Toggle options: Factory Acceptance Test (FAT), On-Site Turnkey Installation, ISO 17025 Calibration Certificate with Traceability, and Operator Technical Training.
            </td>
          </tr>
          <tr>
            <td><strong>Step 4</strong></td>
            <td>Document Upload &amp; Tender Specs</td>
            <td>
              Upload technical drawings, tender RFQ specifications, or process P&amp;IDs (PDF, DOCX, PNG up to 10MB) via drag-and-drop file uploader.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="callout callout-gold">
        <div class="callout-title">Automated Tracking Code Generation</div>
        <p>Upon submission, the engine cryptographically generates a unique tracking code (e.g., <code>RFQ-SAM-2026-9842</code>). The client is presented with a printable confirmation docket and an expected response timeline of <strong>24–48 business hours</strong>. Simultaneously, the dossier is recorded in the administrative lead pipeline.</p>
      </div>

      <!-- Section 6 -->
      <h2>6. ADMINISTRATIVE CMS: AUTHENTICATION &amp; RBAC PERSONAS</h2>
      <p>The Administrative CMS is located at <code>/admin</code> (or accessed via the "Admin Portal" button in the footer). It features a zero-friction demo authentication suite with 3 distinct Role-Based Access Control (RBAC) personas:</p>

      <table>
        <thead>
          <tr>
            <th>Role Persona</th>
            <th>Access Permissions &amp; Responsibilities</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Super Admin</strong> (Dr. Samuel O. - Managing Director)</td>
            <td>Full unconstrained access to Hero Slider, Product Catalog CRUD, Services &amp; FAQ Manager, and Lead &amp; RFQ Pipeline. Can perform CSV exports and change user roles.</td>
          </tr>
          <tr>
            <td><strong>Marketing Editor</strong> (Chioma E. - Content Lead)</td>
            <td>Full write access to Hero Slider Manager, Product &amp; Spec Editor, and Services/FAQ Manager. Read-only or restricted access to confidential sales pricing and pipeline.</td>
          </tr>
          <tr>
            <td><strong>Sales Reviewer</strong> (Tunde B. - Senior Sales Eng.)</td>
            <td>Full access to the Lead &amp; RFQ Pipeline. Can update lead stages (New &rarr; Assigned &rarr; Quoted &rarr; Closed), view submitted tender documents, and trigger CSV/Excel export.</td>
          </tr>
        </tbody>
      </table>

      <!-- Section 7 -->
      <div class="page-break"></div>
      <h2>7. CMS MANAGEMENT SUITES (SLIDER, CATALOG &amp; SERVICES)</h2>

      <h3>A. Homepage Hero Slider Manager</h3>
      <ul>
        <li><strong>Drag-and-Drop Order:</strong> Re-order active slides to prioritize seasonal promotions, newly arrived equipment, or major oil &amp; gas exhibitions.</li>
        <li><strong>Slide Editor:</strong> Modify slide title, subtitle, CTA button label, target destination link, background image URL, and scheduling start/end dates.</li>
        <li><strong>Live Toggle:</strong> Instantly activate or pause slides without deleting them.</li>
      </ul>

      <h3>B. Product &amp; Inventory Catalog Manager</h3>
      <ul>
        <li><strong>Create &amp; Update Equipment:</strong> Add new instruments, model numbers, manufacturer brands, lead time, and base pricing.</li>
        <li><strong>Structured Key-Value Specifications:</strong> Add custom technical attributes (e.g., <em>Measuring Range</em>, <em>Accuracy</em>, <em>Operating Pressure</em>, <em>Output Protocol</em>) rendered in high-fidelity tables on the live site.</li>
        <li><strong>Media &amp; Manuals:</strong> Configure primary photography, high-resolution gallery angles, and links to downloadable technical spec manuals.</li>
        <li><strong>Delete Protection:</strong> Delete outdated products with confirmation checks.</li>
      </ul>

      <h3>C. Pages Content Management Studio (About, Services, Industries &amp; Contact)</h3>
      <p>A unified editing suite empowering editors to manage text, media, and structural data across all public landing pages:</p>
      <ul>
        <li><strong>About Us Page:</strong> Edit corporate mission, vision, 3 core value pillars (Precision, Quality, Reliability), ISO 17025 / ISO 9001 quality accreditations, and executive leadership team members (names, titles, bios).</li>
        <li><strong>Services &amp; Metrology Page:</strong> Customize technical service scopes, calibration ranges &amp; measurement uncertainty budgets (U), turnaround times, and 3-tier Annual Maintenance Contract (AMC) SLAs (Silver, Gold, Platinum).</li>
        <li><strong>Industries &amp; Case Studies:</strong> Manage sector architectures (Food &amp; Beverage, Pharmaceuticals, Petrochemical, Academia), operational applications, recommended equipment, and audited client case studies.</li>
        <li><strong>Contact &amp; Company Info:</strong> Update official hotlines (+234 802 984 4356), corporate email, CAC RC 9898142 credentials, Lagos and Port Harcourt facility addresses, and emergency dispatch desks.</li>
        <li><strong>Live Preview &amp; Factory Reset:</strong> Includes 1-click "View on Site" preview links and "Reset Default" to restore factory template text at any time.</li>
      </ul>

      <h3>D. Services &amp; FAQ Accordion Manager</h3>
      <ul>
        <li><strong>Service Profiles:</strong> Configure calibration scopes, turnaround guarantees (e.g., 48 hours for standard transducers), and pricing models (Fixed Quote vs. Custom Survey).</li>
        <li><strong>Categorized FAQ Accordion:</strong> Group customer questions under <em>Calibration &amp; Metrology</em>, <em>Orders &amp; Shipping</em>, <em>Warranty &amp; Service</em>, and <em>Compliance</em>. Live-reordered in real-time on the public portal.</li>
      </ul>

      <!-- Section 8 -->
      <h2>8. LEAD &amp; RFQ PIPELINE: TRIAGE, STATUS &amp; CSV EXPORT</h2>
      <p>The Lead &amp; RFQ Pipeline serves as Samstrust's central sales accounting inbox, automatically aggregating RFQs, catalog inquiries, and calibration requests.</p>

      <h3>Operating the Pipeline:</h3>
      <ol>
        <li><span class="step-badge">1</span> <strong>Filter Inquiries:</strong> Filter leads by status (<code>All</code>, <code>New</code>, <code>Assigned</code>, <code>Quoted</code>, <code>Closed</code>) or search by customer name, corporate entity, or tracking code.</li>
        <li><span class="step-badge">2</span> <strong>Inspect Full Dossier:</strong> Click on any lead row to view complete client contact details, state of delivery, line items with requested tolerances, uploaded tender specs, and auxiliary service requests.</li>
        <li><span class="step-badge">3</span> <strong>Update Status:</strong> Transition leads as your sales engineering team prepares commercial quotes.</li>
        <li><span class="step-badge">4</span> <strong>One-Click CSV / Excel Export:</strong> Click the <strong>"Export to CSV"</strong> button. The system formats all active leads into a standardized spreadsheet ready for import into ERP systems, SAP, or Microsoft Excel.</li>
      </ol>

      <!-- Section 9 -->
      <div class="page-break"></div>
      <h2>9. TROUBLESHOOTING &amp; OPERATIONAL SUPPORT</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario / Question</th>
            <th>Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Client cannot download Technical Data Sheet</td>
            <td>Ensure pop-up blockers are temporarily disabled for <code>www.samstrusttech.com</code>. The PDF generates directly via browser print services.</td>
          </tr>
          <tr>
            <td>Admin changes not appearing immediately</td>
            <td>The CMS writes directly to persistent browser storage. If using multiple browser windows, refresh the public tab to pull latest updates.</td>
          </tr>
          <tr>
            <td>Need to switch CMS role for testing</td>
            <td>Click the user badge at the top right of the Admin sidebar or header, and select between Super Admin, Editor, or Sales Reviewer.</td>
          </tr>
          <tr>
            <td>Tender document upload limit</td>
            <td>The client-side RFQ engine accepts files up to 10MB (PDF, DOCX, PNG, JPG). For larger files, advise clients to share a cloud link in the custom notes.</td>
          </tr>
        </tbody>
      </table>

      <!-- Verification Footer -->
      <div style="margin-top: 36px; border-top: 2px solid #e2ece7; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-weight: 700; color: #164e3d; font-size: 13px;">SAMSTRUST TECHNOLOGIES LIMITED</div>
          <div style="font-size: 11px; color: #64748b;">Engineering &bull; Metrology &bull; Scientific Solutions</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Lagos &amp; Port Harcourt Facilities &bull; Nigeria</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #64748b;">Document Certified by Technical Lead</div>
          <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #164e3d; margin-top: 3px;">RC 9898142 / AUTH-OK</div>
        </div>
      </div>

      <script>
        // Auto trigger print dialog once document has parsed
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
