// src/types.ts

export type Project = {
  name: string;
  clientEmail: string;
  status: "active" | "archived" | "pending";
  createdAt: any; // firestore.Timestamp
  // Optional last-updated timestamp (Firestore Timestamp)
  updatedAt?: any;
};

export type ProjectFile = {
  name: string;          // "proposal.pdf"
  path: string;          // "projects/{projectId}/{filename}"
  url: string;           // download URL
  size: number;          // bytes
  contentType: string;   // "application/pdf"
  uploadedBy: string;    // email or uid
  uploadedAt: any;       // firestore.Timestamp
};
