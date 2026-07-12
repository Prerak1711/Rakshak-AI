import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { getContacts, type Contact } from "./contacts";

export type EmergencyAlertOptions = {
  subject?: string;
  message?: string;
};

export const sendEmergencyAlerts = async (
  uid: string,
  latitude: number,
  longitude: number,
  options: EmergencyAlertOptions = {}
) => {
  const contacts = await getContacts(uid);

  const locationUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const subject = options.subject || "Rakshak AI Emergency Alert";
  const message =
    options.message ||
    `I need help. My current location: ${locationUrl}`;

  await Promise.all(
    contacts.map(async (contact: Contact) => {
      if (contact.phone) {
        await addDoc(collection(db, "sms_notifications"), {
          uid,
          to: contact.phone,
          body: `${message}\n\nLocation: ${locationUrl}`,
          contactName: contact.name,
          createdAt: new Date(),
        });
      }

      if (contact.email) {
        await addDoc(collection(db, "email_notifications"), {
          uid,
          to: contact.email,
          subject,
          body: `${message}\n\nLocation: ${locationUrl}`,
          contactName: contact.name,
          createdAt: new Date(),
        });
      }
    })
  );
};
