import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase/firestore";

import type { Comment } from "@/types/comment";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export const commentConverter: FirestoreDataConverter<Comment> = {
  toFirestore: ({ id: _id, ...rest }: WithFieldValue<Comment>) => rest,

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Comment => {
    const data = snapshot.data({ serverTimestamps: "estimate" });
    return {
      id: snapshot.id,
      authorId: asString(data.authorId),
      authorName: asString(data.authorName),
      authorPhotoURL:
        typeof data.authorPhotoURL === "string" ? data.authorPhotoURL : null,
      message: asString(data.message),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    };
  },
};
