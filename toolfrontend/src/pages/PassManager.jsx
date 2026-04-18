import React, { useEffect, useState, useRef } from "react";
import { showSuccess, showError } from "../utils/toast";
import Spinner from "../components/Spinner";
import {
  createPassword,
  getPasswords,
  updatePassword,
  deletePassword,
} from "../api/passwordApi";
import Navbar2 from "../components/Navbar2";

export default function PassManager() {
  const [passwords, setPasswords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    service_name: "",
    username: "",
    password: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showEntries, setShowEntries] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const cleanDomain = (domain) => {
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .toLowerCase()
      .trim();
  };

  const isValidDomain = (domain) => {
    const domainRegex =
      /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const loadPasswords = async () => {
    try {
      setIsLoading(true);
      const data = await getPasswords();
      setPasswords(data);
      setShowEntries(false);
      setVisiblePasswords({});
    } catch (err) {
      showError("Failed to load passwords");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  const submit = async () => {
    if (!editingId && (!form.service_name || !form.username || !form.password)) {
      showError("All fields required");
      return;
    }

    const cleanedService = cleanDomain(form.service_name);

    if (!isValidDomain(cleanedService)) {
      showError("Enter valid service domain (e.g., google.com)");
      return;
    }

    try {
      setIsSaving(true);

      const updatedForm = {
        ...form,
        service_name: cleanedService,
      };

      if (editingId) {
        await updatePassword(editingId, updatedForm);
        showSuccess("Password updated");
        setEditingId(null);
      } else {
        await createPassword(updatedForm);
        showSuccess("Password saved");
      }

      setForm({ service_name: "", username: "", password: "" });
      await loadPasswords();
    } catch (err) {
      showError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({
      service_name: p.service,
      username: p.username,
      password: p.password,
    });

    const offset = 120;
    const elementPosition = formRef.current.getBoundingClientRect().top;
    const offsetPosition = window.pageYOffset + elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const remove = async (id) => {
    try {
      setDeletingId(id);
      await deletePassword(id);
      showSuccess("Password deleted");
      await loadPasswords();
    } catch (err) {
      showError("Failed to delete password");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      <Navbar2 />

      <div className="min-h-screen bg-gradient-to-br from-[#b46dfb] to-[#5217d3] px-3 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-14 md:py-16">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="mb-10 text-center mt-16 sm:mt-18 md:mt-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black ">
              Password Manager
            </h1>
            <p className="text-gray-700 text-sm sm:text-base mt-2">
              Securely store and manage your credentials
            </p>
          </div>

          {/* FORM */}
          <div
            ref={formRef}
            className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 mb-12"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              {editingId ? "✏️ Edit Entry" : "➕ Add New Entry"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <input
                placeholder="Service"
                className="p-3 border rounded-lg w-full text-sm sm:text-base"
                value={form.service_name}
                onChange={(e) =>
                  setForm({ ...form, service_name: e.target.value })
                }
              />

              <input
                placeholder="Username"
                className="p-3 border rounded-lg w-full text-sm sm:text-base"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />

              <input
                placeholder="Password"
                className="p-3 border rounded-lg w-full text-sm sm:text-base"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <button
              onClick={submit}
              disabled={isSaving}
              className={`mt-6 w-full sm:w-auto px-8 py-2 rounded-lg transition ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#9659FB] hover:bg-[#7c3aed] text-white"
              }`}
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="flex justify-center mt-20">
              <Spinner size={60} />
            </div>
          )}

          {/* SHOW PASSWORD BUTTON */}
          {passwords.length > 0 && !showEntries && (
            <div className="text-center mb-10">
              <button
                onClick={() => setShowEntries(true)}
                className="bg-[#9659FB] animate-pulse font-bold text-white px-10 py-3 rounded-full hover:scale-105 transition"
              >
                Show Passwords
              </button>
            </div>
          )}

          {/* PASSWORD CARDS */}
          {showEntries && (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {passwords.map((p) => {
                const isVisible = visiblePasswords[p.id];

                return (
                  <div
                    key={p.id}
                    className="blur-reveal-wrapper shadow-2xl"
                  >
                    <div className="blur-overlay" />

                    <div className="p-5 sm:p-6 md:p-8 relative z-10">

                      <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-mono font-bold text-gray-900 mb-6 break-words">
                        {p.service}
                      </h2>

                      <div className="border-b border-gray-200 mb-6" />

                      <div className="mb-6">
                        <p className="text-gray-800 text-sm sm:text-base mb-1">
                          Username
                        </p>

                        <div className="flex justify-between items-center gap-2">
                          <p className="text-sm sm:text-base md:text-lg break-all">
                            {p.username}
                          </p>

                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(p.username);
                                showSuccess("Username copied successfully!");
                              } catch {
                                showError("Failed to copy!");
                              }
                            }}
                            className="bg-gray-100 p-2 rounded-full"
                          >
                            📋
                          </button>
                        </div>
                      </div>

                      <div className="border-b border-gray-200 mb-6" />

                      <div className="mb-8">
                        <p className="text-gray-800 text-sm sm:text-base mb-1">
                          Password
                        </p>

                        <div className="flex justify-between items-center gap-2">
                          <p className="font-mono text-sm sm:text-base md:text-lg break-all">
                            {isVisible ? p.password : "••••••••••"}
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleVisibility(p.id)}
                              className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              {isVisible ? "Hide" : "Reveal"}
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(p.password);
                                  showSuccess("Password copied successfully!");
                                } catch {
                                  showError("Failed to copy!");
                                }
                              }}
                              className="bg-gray-100 p-2 rounded-full"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                          onClick={() => edit(p)}
                          className="w-full bg-purple-200 text-purple-800 py-3 rounded-full"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => remove(p.id)}
                          disabled={deletingId === p.id}
                          className={`w-full py-3 rounded-full ${
                            deletingId === p.id
                              ? "bg-gray-300 text-gray-600"
                              : "bg-red-400 text-white"
                          }`}
                        >
                          {deletingId === p.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}