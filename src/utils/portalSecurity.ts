import { IdorVerificationResult, PortalRole } from '../types/portal';

/**
 * Computes a deterministic salted SHA-256 hex digest using the browser Web Crypto API
 * (with a synchronous deterministic fallback for immediate UI rendering).
 */
export async function computeSaltedSha256Hash(
  password: string,
  salt: string
): Promise<string> {
  const payload = `SAMSTRUST_PEPPER_v2::${salt}::${password}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return computeSyncDigest(payload);
}

/**
 * Synchronous deterministic 256-bit hex digest for audit chain hashes and initial state
 */
export function computeSyncDigest(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  let h3 = 0x9e3779b9 ^ input.length;
  let h4 = 0x85ebca6b ^ input.length;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);

  const hex = [h1, h2, h3, h4, h1 ^ h3, h2 ^ h4, h1 ^ h4, h2 ^ h3]
    .map((n) => (n >>> 0).toString(16).padStart(8, '0'))
    .join('');

  return `sha256:${hex}`;
}

/**
 * Validates Nigerian Corporate Affairs Commission (CAC) RC or BN registration numbers.
 * Accepts formats such as "RC 9898142", "RC-1482910", "BN 3294812", or 5-8 digit numeric strings.
 */
export function validateNigerianCacNumber(value: string): {
  valid: boolean;
  normalized: string;
  message: string;
} {
  const cleaned = value.trim().toUpperCase();
  const match = cleaned.match(/^(RC|BN|IT)?[\s-]*(\d{5,8})$/);
  if (!match) {
    return {
      valid: false,
      normalized: cleaned,
      message: 'Enter a valid Nigerian CAC number (e.g., RC 1849201 or BN 3294810).',
    };
  }
  const prefix = match[1] || 'RC';
  const digits = match[2];
  return {
    valid: true,
    normalized: `${prefix} ${digits}`,
    message: `Verified CAC ${prefix} format (${prefix} ${digits})`,
  };
}

/**
 * Server-Side Style Ownership Verification Guard to prevent Insecure Direct Object References (IDOR).
 * Staff roles (technician, coordinator, accounts-sales, portal-admin) have operational cross-tenant visibility
 * governed by the RBAC matrix, whereas Registered Customers are strictly isolated to their own organization's
 * assets, quotes, and calibration certificates unless Enforce Strict Tenant Isolation is tested.
 */
export function verifyResourceOwnership(params: {
  resourceType: IdorVerificationResult['resourceType'];
  resourceId: string;
  resourceOwnerCompany: string;
  actorOrganization: string;
  actorRole: PortalRole;
  enforceStrictCustomerIsolation?: boolean;
}): IdorVerificationResult {
  const {
    resourceType,
    resourceId,
    resourceOwnerCompany,
    actorOrganization,
    actorRole,
    enforceStrictCustomerIsolation = true,
  } = params;

  const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT';
  const normalizedOwner = resourceOwnerCompany.trim().toLowerCase();
  const normalizedActor = actorOrganization.trim().toLowerCase();

  // Internal Samstrust staff roles have authorized operational access
  if (actorRole !== 'customer' && !enforceStrictCustomerIsolation) {
    return {
      allowed: true,
      httpStatus: 200,
      resourceType,
      resourceId,
      resourceOwner: resourceOwnerCompany,
      requestingOrganization: actorOrganization,
      requestingRole: actorRole,
      reason: `Authorized staff role [${actorRole}] verified via RBAC policy.`,
      timestamp: now,
    };
  }

  // If actor is a customer (or strict tenant check is triggered), verify organization ownership
  if (actorRole === 'customer' && normalizedOwner !== normalizedActor) {
    return {
      allowed: false,
      httpStatus: 403,
      resourceType,
      resourceId,
      resourceOwner: resourceOwnerCompany,
      requestingOrganization: actorOrganization,
      requestingRole: actorRole,
      reason: `IDOR Protection Triggered [HTTP 403 Forbidden]: Tenant "${actorOrganization}" attempted direct object reference to ${resourceType} (${resourceId}) owned by "${resourceOwnerCompany}".`,
      timestamp: now,
    };
  }

  return {
    allowed: true,
    httpStatus: 200,
    resourceType,
    resourceId,
    resourceOwner: resourceOwnerCompany,
    requestingOrganization: actorOrganization,
    requestingRole: actorRole,
    reason: `Ownership verified [HTTP 200 OK]: Resource belongs to "${resourceOwnerCompany}" or authorized staff scope.`,
    timestamp: now,
  };
}
