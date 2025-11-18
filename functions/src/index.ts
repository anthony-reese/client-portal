// functions/src/index.ts
export const runtime = "nodejs";

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {
  onDocumentCreated,
  onDocumentWritten,
  onDocumentUpdated,
  onDocumentWritten as onUserWritten,
} from "firebase-functions/v2/firestore";

import * as admin from "firebase-admin";

// --------------------------
//  Firebase Admin Init
// --------------------------
if (!admin.apps.length) {
  admin.initializeApp();
  console.log("✅ Firebase Admin initialized");
}
const db = admin.firestore();
const storage = admin.storage();

// --------------------------
//  Callable: setAdminRole
// --------------------------
interface SetAdminData {
  email: string;
}

/**
 * Allows an existing admin to grant admin privileges to another user.
 * Only callable by users with `admin: true` in their token claims.
 */
export const setAdminRole = onCall<SetAdminData>(async (request) => {
  const context = request.auth;
  const data = request.data;

  // Require authentication
  if (!context) {
    throw new HttpsError(
      "unauthenticated", "You must be signed in to call this function.");
  }

  // Require existing admin privileges
  if (!context.token.admin) {
    throw new HttpsError("permission-denied",
      "Only admins can grant admin roles.");
  }

  const email = data?.email;
  if (!email) {
    throw new HttpsError("invalid-argument", "Missing required field: email.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {admin: true});

    console.log(`✅ ${email} granted admin role`);
    return {message: `✅ Success! ${email} is now an admin.`};
  } catch (err) {
    console.error("❌ Error setting admin role:", err);
    throw new HttpsError("internal", "Failed to set admin role.");
  }
});

// --------------------------
//  Firestore Trigger: onProjectCreate
// --------------------------
/**
 * Runs whenever a new project document is created in /projects.
 * - Creates a folder in Cloud Storage
 * - Logs the event in /projectLogs
 */
export const onProjectCreate = onDocumentCreated(
  "projects/{projectId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.warn("⚠️ No data associated with the event");
      return;
    }

    const projectId = event.params.projectId;
    const project = snapshot.data();
    const clientEmail = project.clientEmail;

    console.log(`🆕 Project created: ${projectId} for ${clientEmail}`);

    try {
      // Create a Storage folder for project files
      const bucket = storage.bucket();
      await bucket.file(`projects/${projectId}/.init`).save("");

      // Add an audit log entry
      await db.collection("projectLogs").add({
        projectId,
        message: `Project created for ${clientEmail}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`📁 Storage folder initialized for project ${projectId}`);
    } catch (error) {
      console.error(`
        ❌ Error in project creation trigger for ${projectId}:`, error);
    }
  });

// --------------------------
//  Firestore Trigger: onProjectUpdate
// --------------------------
/**
 * Runs on any project update or write.
 * - Automatically updates the "updatedAt" timestamp field
 */
export const onProjectUpdate = onDocumentWritten(
  "projects/{projectId}", async (event) => {
    const after = event.data?.after;
    if (!after) {
      console.log("⚠️ No new data for this event (probably deleted)");
      return null;
    }

    try {
      await after.ref.update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`🕒 Updated timestamp for project: ${event.params.projectId}`);
    } catch (error) {
      console.error("❌ Error updating timestamp:", error);
    }

    return null;
  });

// --------------------------
//  Firestore Trigger: onFileApproval
// --------------------------
/**
 * Runs when a file document is updated in /projects/{projectId}/files/{fileId}.
 * Logs file status changes (e.g., pending -> approved) to /projectLogs.
 */
export const onFileApproval = onDocumentUpdated(
  "projects/{projectId}/files/{fileId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return null;

    // Log only status changes
    if (before.status !== after.status) {
      await db.collection("projectLogs").add({
        projectId: event.params.projectId,
        fileId: event.params.fileId,
        action: `status:${before.status}->${after.status}`,
        reviewedBy: after.reviewedBy ?? "unknown",
        reviewedAt: after.reviewedAt ?? null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(
        `📋 File status changed: ${event.params.fileId} ` +
        `(${before.status} → ${after.status})`
      );
    }

    return null;
  }
);

export const syncAdminClaim = onUserWritten("users/{uid}", async (event) => {
  const after = event.data?.after;
  if (!after) return null;

  const uid = event.params.uid;
  const userData = after.data();
  const role = userData?.role;

  try {
    const user = await admin.auth().getUser(uid);
    const currentClaims = user.customClaims || {};

    // Only update if claim differs from Firestore role
    if (role === "admin" && !currentClaims.admin) {
      await admin.auth().setCustomUserClaims(uid,
        {...currentClaims, admin: true});
      console.log(`✅ Synced admin claim for user ${uid}`);
    } else if (role !== "admin" && currentClaims.admin) {
      await admin.auth().setCustomUserClaims(uid,
        {...currentClaims, admin: false});
      console.log(`🟡 Removed admin claim for user ${uid}`);
    }
  } catch (error) {
    console.error("❌ Error syncing admin claim:", error);
  }

  return null;
});

console.log(
  "🔥 Functions loaded: setAdminRole, onProjectCreate, " +
  "onProjectUpdate, onFileApproval, syncAdminClaim");
