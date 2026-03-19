/**
 * FHIR R4 type definitions for Mon Espace Santé integration
 *
 * Based on HL7 FHIR R4 (v4.0.1) specification.
 * Only includes resources relevant to pediatric health tracking.
 *
 * @see https://hl7.org/fhir/R4/
 * @see https://interop.esante.gouv.fr/
 */

// --- Primitive & Complex Data Types ---

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
}

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
  version?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  display?: string;
  type?: string;
}

export interface FHIRQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRIdentifier {
  system?: string;
  value?: string;
  use?: "usual" | "official" | "temp" | "secondary" | "old";
}

export interface FHIRHumanName {
  family?: string;
  given?: string[];
  use?: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
}

export interface FHIRAddress {
  line?: string[];
  city?: string;
  postalCode?: string;
  country?: string;
  use?: "home" | "work" | "temp" | "old" | "billing";
}

export interface FHIRContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
}

export interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string; // base64
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

export interface FHIRAnnotation {
  text: string;
  authorReference?: FHIRReference;
  time?: string;
}

// --- Base Resource ---

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
}

// --- Bundle (search results / collections) ---

export interface FHIRBundleLink {
  relation: string;
  url: string;
}

export interface FHIRBundleEntry<T extends FHIRResource = FHIRResource> {
  fullUrl?: string;
  resource?: T;
  search?: {
    mode?: "match" | "include" | "outcome";
    score?: number;
  };
}

export interface FHIRBundle<T extends FHIRResource = FHIRResource> extends FHIRResource {
  resourceType: "Bundle";
  type: "searchset" | "batch" | "transaction" | "batch-response" | "transaction-response" | "collection" | "document" | "message";
  total?: number;
  link?: FHIRBundleLink[];
  entry?: FHIRBundleEntry<T>[];
}

// --- OperationOutcome (errors) ---

export interface FHIROperationOutcomeIssue {
  severity: "fatal" | "error" | "warning" | "information";
  code: string;
  details?: FHIRCodeableConcept;
  diagnostics?: string;
  location?: string[];
}

export interface FHIROperationOutcome extends FHIRResource {
  resourceType: "OperationOutcome";
  issue: FHIROperationOutcomeIssue[];
}

// --- Patient ---

export interface FHIRPatient extends FHIRResource {
  resourceType: "Patient";
  identifier?: FHIRIdentifier[];
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: FHIRAddress[];
  contact?: Array<{
    relationship?: FHIRCodeableConcept[];
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
  }>;
  active?: boolean;
}

// --- Immunization ---

export interface FHIRImmunizationPerformer {
  function?: FHIRCodeableConcept;
  actor: FHIRReference;
}

export interface FHIRImmunizationReaction {
  date?: string;
  detail?: FHIRReference;
  reported?: boolean;
}

export interface FHIRImmunizationProtocolApplied {
  series?: string;
  authority?: FHIRReference;
  targetDisease?: FHIRCodeableConcept[];
  doseNumberPositiveInt?: number;
  doseNumberString?: string;
  seriesDosesPositiveInt?: number;
}

export interface FHIRImmunization extends FHIRResource {
  resourceType: "Immunization";
  status: "completed" | "entered-in-error" | "not-done";
  vaccineCode: FHIRCodeableConcept;
  patient: FHIRReference;
  occurrenceDateTime?: string;
  occurrenceString?: string;
  recorded?: string;
  lotNumber?: string;
  expirationDate?: string;
  site?: FHIRCodeableConcept;
  route?: FHIRCodeableConcept;
  doseQuantity?: FHIRQuantity;
  performer?: FHIRImmunizationPerformer[];
  note?: FHIRAnnotation[];
  reaction?: FHIRImmunizationReaction[];
  protocolApplied?: FHIRImmunizationProtocolApplied[];
}

// --- Observation (vital signs, growth measurements) ---

export interface FHIRObservationReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  type?: FHIRCodeableConcept;
  text?: string;
}

export interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
}

export interface FHIRObservation extends FHIRResource {
  resourceType: "Observation";
  status: "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown";
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime?: string;
  effectivePeriod?: FHIRPeriod;
  issued?: string;
  performer?: FHIRReference[];
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept[];
  note?: FHIRAnnotation[];
  referenceRange?: FHIRObservationReferenceRange[];
  component?: FHIRObservationComponent[];
}

// --- AllergyIntolerance ---

export interface FHIRAllergyIntoleranceReaction {
  substance?: FHIRCodeableConcept;
  manifestation: FHIRCodeableConcept[];
  severity?: "mild" | "moderate" | "severe";
  onset?: string;
  note?: FHIRAnnotation[];
}

export interface FHIRAllergyIntolerance extends FHIRResource {
  resourceType: "AllergyIntolerance";
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  type?: "allergy" | "intolerance";
  category?: Array<"food" | "medication" | "environment" | "biologic">;
  criticality?: "low" | "high" | "unable-to-assess";
  code?: FHIRCodeableConcept;
  patient: FHIRReference;
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: FHIRReference;
  note?: FHIRAnnotation[];
  reaction?: FHIRAllergyIntoleranceReaction[];
}

// --- DocumentReference ---

export interface FHIRDocumentReferenceContent {
  attachment: FHIRAttachment;
  format?: FHIRCoding;
}

export interface FHIRDocumentReference extends FHIRResource {
  resourceType: "DocumentReference";
  status: "current" | "superseded" | "entered-in-error";
  type?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  subject?: FHIRReference;
  date?: string;
  author?: FHIRReference[];
  description?: string;
  content: FHIRDocumentReferenceContent[];
}

// --- LOINC codes for pediatric measurements ---

export const LOINC = {
  BODY_WEIGHT: "29463-7",
  BODY_HEIGHT: "3137-7",
  HEAD_CIRCUMFERENCE: "9843-4",
  BODY_WEIGHT_DISPLAY: "Body weight",
  BODY_HEIGHT_DISPLAY: "Body height",
  HEAD_CIRCUMFERENCE_DISPLAY: "Head Occipital-frontal circumference",
} as const;

export const LOINC_SYSTEM = "http://loinc.org";
export const SNOMED_SYSTEM = "http://snomed.info/sct";
export const CVX_SYSTEM = "http://hl7.org/fhir/sid/cvx";
export const UNITS_SYSTEM = "http://unitsofmeasure.org";

// --- FHIR clinical status code systems ---

export const ALLERGY_CLINICAL_STATUS_SYSTEM = "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical";
export const ALLERGY_VERIFICATION_STATUS_SYSTEM = "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification";

// --- Mon Espace Santé connection types ---

export type MESConnectionStatus = "connected" | "syncing" | "error" | "disconnected" | "token_expired";
export type FHIRSyncDirection = "pull" | "push";
export type FHIRSyncStatus = "success" | "partial" | "error";
export type FHIRResourceType = "Immunization" | "Observation" | "AllergyIntolerance" | "DocumentReference" | "Patient";

export interface MESConnection {
  id: string;
  memberId: string;
  householdId: string;
  mesPatientId: string;
  tokenExpiry: string | null;
  consentGrantedAt: string;
  lastSyncAt: string | null;
  syncStatus: MESConnectionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FHIRSyncLogEntry {
  id: string;
  householdId: string;
  memberId: string;
  resourceType: FHIRResourceType;
  direction: FHIRSyncDirection;
  recordsSynced: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  status: FHIRSyncStatus;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}
