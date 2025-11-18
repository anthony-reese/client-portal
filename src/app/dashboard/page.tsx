// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  getIdTokenResult,
  getAuth,
} from "firebase/auth";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import ProjectList from "@/components/ProjectList";
import CreateProjectForm from "@/components/CreateProjectForm";
import AdminProjectFiles from "@/components/AdminProjectFiles";
import FileUploader from "@/components/FileUploader";

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();

  // Verify admin claim
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const token = await getIdTokenResult(user, true); // force refresh
        if (token.claims?.admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/");
        }
      } catch (err) {
        console.error("Error checking token claims:", err);
        setIsAdmin(false);
        router.push("/");
      }
    });
    return () => unsub();
  }, [router]);

  // Fetch users + projects (admin-only)
  useEffect(() => {
    if (isAdmin !== true) return;
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setUsers(
          usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as User[]
        );

        const projectsSnap = await getDocs(collection(db, "projects"));
        setProjects(
          projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  // Role toggle helper
  const toggleRole = async (user: User) => {
    try {
      const ref = doc(db, "users", user.id);
      const newRole = user.role === "admin" ? "client" : "admin";
      await updateDoc(ref, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      alert(`Updated ${user.email} → ${newRole}`);
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  if (isAdmin === null) return <p className="p-4">Checking privileges…</p>;
  if (!isAdmin) return null;
  if (loading) return <p className="p-4">Loading dashboard…</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Projects section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Projects</h2>
        <ProjectList />
        <CreateProjectForm />
        <div className="mt-6 space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-800 bg-gray-900 p-4 rounded-lg"
            >
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-400">
                Client: {project.clientEmail} — Status: {project.status}
              </p>

              {/* File upload / list component */}
              <div className="mt-4">
                <AdminProjectFiles
                  projectId={project.id}
                  adminEmail={project.clientEmail}
                />
                <FileUploader projectId={project.id} clientEmail={auth.currentUser?.email || null} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User table section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="py-2 px-4">{u.name ?? "—"}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.role ?? "client"}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => toggleRole(u)}
                    className={`px-3 py-1 rounded text-white ${
                      u.role === "admin" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
