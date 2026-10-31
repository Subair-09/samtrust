import React from 'react';
import { X, ShieldCheck, Scale, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'compliance' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0E3529]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] overflow-hidden z-10 max-h-[85vh] flex flex-col my-auto">
        <div className="p-5 border-b border-[#E2ECE7] flex items-center justify-between bg-[#F4F8F6]">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-[#164E3D]" />}
            {type === 'terms' && <Scale className="w-5 h-5 text-[#164E3D]" />}
            {type === 'compliance' && <FileText className="w-5 h-5 text-[#D4AF37]" />}
            <div>
              <h3 className="text-base font-bold text-[#164E3D]">
                {type === 'privacy' && 'Corporate Privacy Policy'}
                {type === 'terms' && 'Commercial Terms of Service & Supply'}
                {type === 'compliance' && 'ISO/IEC 17025 & Metrological Compliance'}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Samstrust Technologies Limited &bull; RC 9898142
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                <strong>1. General Information:</strong> Samstrust Technologies Limited (RC 9898142) is committed to safeguarding corporate data, engineering specifications, and client trade details shared during quotations, factory audits, and calibration procedures in compliance with the Nigeria Data Protection Act (NDPA) and international standards.
              </p>
              <p>
                <strong>2. Scope of Collected Technical Data:</strong> When requesting quotations, technical specifications (pipeline parameters, flow rates, chemical compatibility, drawings) and commercial contact info are utilized strictly for generating proposals, compliance verification, and delivery coordination.
              </p>
              <p>
                <strong>3. Non-Disclosure & Security:</strong> We enforce strict technical NDAs. No proprietary process parameters or plant schematics are disclosed to third parties without prior written authorization.
              </p>
              <p>
                <strong>4. Inquiries:</strong> Direct data privacy inquiries to our compliance desk: <span className="font-mono text-[#164E3D]">Info@samstrusttech.com</span>.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                <strong>1. Quotation Validity & Supply:</strong> All commercial quotations issued by Samstrust Technologies Limited remain valid for thirty (30) calendar days unless otherwise stated. Prices reflect international currency parity and manufacturer ex-works conditions.
              </p>
              <p>
                <strong>2. Warranty & Factory Guarantee:</strong> All process transmitters, flowmeters, laboratory analytical balances, and fume cupboards supplied carry a standard 12-month manufacturer defect warranty from commissioning date, backed by original OEM spare availability.
              </p>
              <p>
                <strong>3. Acceptance & Calibration:</strong> Equipment requiring ISO/IEC 17025 calibration is subjected to rigorous multi-point verification before factory release. Clients are entitled to witness tests upon request.
              </p>
              <p>
                <strong>4. Governing Law:</strong> All supply contracts and technical agreements are governed by the laws of the Federal Republic of Nigeria.
              </p>
            </>
          )}

          {type === 'compliance' && (
            <>
              <p>
                <strong>1. ISO/IEC 17025:2017 Alignment:</strong> Samstrust Technologies maintains strict traceability to the National Metrology Institute (NMI) and international BIPM standards for mass, pressure, temperature, and volumetric flow measurements.
              </p>
              <p>
                <strong>2. Traceability Documentation:</strong> Every calibrated asset is accompanied by an unbroken chain of calibration certificates documenting reference standard serials, temperature/humidity ambient controls, expanded uncertainty ($k = 2$), and recalibration dates.
              </p>
              <p>
                <strong>3. Laboratory Safety & Ventilation (EN 14175):</strong> Our fume cupboards and containment booths adhere to EN 14175-3 aerodynamic containment standards, ASHRAE 110 velocity profiles, and SEFA 8 laboratory casework requirements.
              </p>
              <p>
                <strong>4. ATEX & Hazardous Areas (IEC 60079):</strong> Industrial instrumentation supplied for Oil & Gas exploration is certified for Zone 0, Zone 1, and Zone 2 hazardous explosive environments.
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-[#E2ECE7] bg-[#F4F8F6] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs py-2 px-5"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
