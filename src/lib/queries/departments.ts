import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "../firebase";

export type Department = {
  id: string;
  name: string;
  icon?: string;
};

export async function getDepartments(): Promise<Department[]> {
  const departmentsRef = collection(db, "departments");
  const snapshot = await getDocs(query(departmentsRef, orderBy("name")));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: (data.name as string) ?? "Department",
      icon: data.icon as string | undefined,
    };
  });
}

export async function getDepartment(departmentId: string): Promise<Department | null> {
  const ref = doc(db, "departments", departmentId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: (data.name as string) ?? "Department",
    icon: data.icon as string | undefined,
  };
}
