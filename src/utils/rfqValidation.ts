export interface RfqLineItem {
  id: string;
  name: string;
  model: string;
  quantity: number;
  specs?: string;
  unitPriceUSD: number;
  isCustom?: boolean;
}

export interface RfqFormData {
  // Step 1: Customer & Company Details
  companyName: string;
  rcNumber?: string;
  taxId?: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  deliveryState: string;
  deliveryAddress: string;

  // Step 2: Item Selection & Scope
  items: RfqLineItem[];

  // Step 3: Service Requirements
  fatRequired: boolean;
  installationRequired: boolean;
  isoCalibrationRequired: boolean;
  trainingRequired: boolean;
  maintenanceSla: 'none' | 'silver' | 'gold' | 'platinum';
  deliveryTimeline: string;

  // Step 4: Supporting Document Upload & Scope Notes
  documentFile?: {
    name: string;
    size: number;
    type: string;
  } | null;
  specialInstructions?: string;
  honeypotField?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Nigerian States for authoritative delivery selection
export const NIGERIAN_STATES = [
  'Lagos State',
  'Rivers State (Port Harcourt)',
  'Kano State',
  'Ogun State',
  'Delta State (Warri / Asaba)',
  'Federal Capital Territory (Abuja)',
  'Kaduna State',
  'Oyo State (Ibadan)',
  'Akwa Ibom State',
  'Edo State (Benin City)',
  'Ondo State',
  'Anambra State (Onitsha)',
  'Enugu State',
  'Cross River State (Calabar)',
  'Abia State (Aba)',
  'Imo State',
  'Bayelsa State',
  'Kwara State',
  'Plateau State (Jos)',
  'Other State / Nationwide Offshore',
];

/**
 * Validates an individual step of the RFQ flow.
 */
export const validateRfqStep = (step: number, data: Partial<RfqFormData>): ValidationResult => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!data.companyName || data.companyName.trim().length < 2) {
      errors.companyName = 'Company / Organization name is required (min 2 characters).';
    }

    if (!data.contactName || data.contactName.trim().length < 2) {
      errors.contactName = 'Contact Person name is required.';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Please provide a valid corporate email address.';
    }

    if (!data.phone || data.phone.trim().length < 8) {
      errors.phone = 'Valid phone number with country code is required (e.g. +234 802 984 4356).';
    }

    if (!data.deliveryState || data.deliveryState.trim().length === 0) {
      errors.deliveryState = 'Please select a delivery state in Nigeria.';
    }

    if (!data.deliveryAddress || data.deliveryAddress.trim().length < 5) {
      errors.deliveryAddress = 'Facility site address or plant location is required.';
    }
  }

  if (step === 2) {
    if (!data.items || data.items.length === 0) {
      errors.items = 'Please select at least one instrument or specify a custom equipment line item.';
    } else {
      data.items.forEach((item, index) => {
        if (!item.quantity || item.quantity < 1) {
          errors[`item_${index}_quantity`] = `Quantity for ${item.name} must be at least 1 unit.`;
        }
      });
    }
  }

  if (step === 3) {
    if (!data.deliveryTimeline) {
      errors.deliveryTimeline = 'Please specify your target delivery schedule.';
    }
  }

  if (step === 4) {
    // Check file size if uploaded (< 10MB)
    if (data.documentFile) {
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      if (data.documentFile.size > maxSizeBytes) {
        errors.documentFile = 'File size exceeds maximum permitted limit of 10MB.';
      }
    }

    // Check anti-spam honeypot
    if (data.honeypotField && data.honeypotField.trim().length > 0) {
      errors.security = 'Automated bot activity flagged.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generates an automated unique reference tracking code: RFQ-SAM-2026-XXXX
 */
export const generateRfqReferenceCode = (): string => {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RFQ-SAM-${currentYear}-${randomSuffix}`;
};
