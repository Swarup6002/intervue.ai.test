/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: teammembers
 * Interface for TeamMembers
 */
export interface TeamMembers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType text */
  role?: string;
  /** @wixFieldType text */
  bio?: string;
  /** @wixFieldType image */
  profilePicture?: string;
  /** @wixFieldType url */
  linkedInUrl?: string;
  /** @wixFieldType number */
  displayOrder?: number;
}
