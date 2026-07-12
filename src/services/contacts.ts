import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface Contact {
  id?: string;
  uid: string;
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export const addContact = async (contact: Contact) => {
  await addDoc(collection(db, "contacts"), contact);
};

export const getContacts = async (uid: string) => {
  const q = query(
    collection(db, "contacts"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Contact[];
};

export const deleteContact = async (id: string) => {
  await deleteDoc(doc(db, "contacts", id));
};