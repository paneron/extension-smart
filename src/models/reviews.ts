/**
 * Codes in this folder are initial codes for the extension.
 * I (Wai Kit) am not sure what the effect is.
 * Ignored so far.
 */

export interface Review {
  timeRequested: Date;

  id: string;
  // Based on objectType, objectID and revisionID

  objectType: string;
  objectID: string;
  revisionID: string;

  notes?: string;
  metadata?: object;

  approved?: boolean;
  reviewerName?: string;
  timeCompleted?: Date;
}
