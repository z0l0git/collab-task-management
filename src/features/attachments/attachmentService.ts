import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import {
  getFirebaseDb,
  getFirebaseStorage,
  isFirebaseError,
} from "@/lib/firebase";

import type { Attachment } from "./types";

export const attachmentsRef = (workspaceId: string, taskId: string) =>
  collection(
    getFirebaseDb(),
    "workspaces",
    workspaceId,
    "tasks",
    taskId,
    "attachments",
  );

export const uploadAttachment = async (
  workspaceId: string,
  taskId: string,
  uid: string,
  file: File,
  onProgress: (percent: number) => void,
) => {
  const metadataRef = doc(attachmentsRef(workspaceId, taskId));
  const storagePath = `workspaces/${workspaceId}/tasks/${taskId}/${metadataRef.id}`;
  const fileRef = ref(getFirebaseStorage(), storagePath);

  const upload = uploadBytesResumable(fileRef, file, {
    contentType: file.type,
    contentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  });
  upload.on("state_changed", (snapshot) =>
    onProgress(
      Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
    ),
  );
  await upload;

  try {
    await setDoc(metadataRef, {
      name: file.name,
      size: file.size,
      contentType: file.type,
      storagePath,
      uploadedBy: uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    await deleteObject(fileRef).catch(() => undefined);
    throw error;
  }
};

export const attachmentUrl = (attachment: Pick<Attachment, "storagePath">) =>
  getDownloadURL(ref(getFirebaseStorage(), attachment.storagePath));

export const deleteAttachment = async (
  workspaceId: string,
  taskId: string,
  attachment: Attachment,
) => {
  await deleteObject(ref(getFirebaseStorage(), attachment.storagePath)).catch(
    (error: unknown) => {
      if (
        !isFirebaseError(error) ||
        error.code !== "storage/object-not-found"
      ) {
        throw error;
      }
    },
  );
  await deleteDoc(doc(attachmentsRef(workspaceId, taskId), attachment.id));
};
