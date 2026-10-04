import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase/firestore";

import type { Attachment } from "./types";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export const attachmentConverter: FirestoreDataConverter<Attachment> = {
  toFirestore: ({ id: _id, ...rest }: WithFieldValue<Attachment>) => rest,

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
  ): Attachment => {
    const data = snapshot.data({ serverTimestamps: "estimate" });
    return {
      id: snapshot.id,
      name: asString(data.name),
      size: typeof data.size === "number" ? data.size : 0,
      contentType: asString(data.contentType),
      storagePath: asString(data.storagePath),
      uploadedBy: asString(data.uploadedBy),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    };
  },
};
