import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export const updateLiveLocation = async (
  uid: string,
  latitude: number,
  longitude: number,
  accuracy: number
) => {
  await setDoc(
    doc(db, "live_locations", uid),
    {
      latitude,
      longitude,
      accuracy,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
};