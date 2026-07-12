import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

export const notifyContacts = async (uid: string) => {

  const q = query(
    collection(db, "contacts"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  const contacts = [];

  for (const document of snapshot.docs) {

    await updateDoc(document.ref, {
      notified: true,
    });

    contacts.push(document.data());

  }

  return contacts;

};