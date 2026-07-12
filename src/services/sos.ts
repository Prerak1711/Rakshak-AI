import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const createSOS = async (
  uid: string,
  latitude: number,
  longitude: number
) => {
  return await addDoc(collection(db, "sos"), {
    uid,
    latitude,
    longitude,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });
};
