import React, { useState } from "react";
import { getEntries, addEntry, deleteEntry, updateEntry ,getEntryById} from "../api";

export default function PassManagerPhase2() {
  const [entries, setEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);
  const [newEntry, setNewEntry] = useState({ website: "", username: "", password: "" });
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState({}); // track reveal loading per entry
  const [error, setError] = useState(null);
  const [showPasswords,setShowPasswords]=useState(false);

 
  async function loadEntries() {
    const data = await getEntries();
    setEntries(data);
    setShowEntries(true);
  }

  async function handleAdd(e){
    e.preventDefault();
    await addEntry(newEntry);
    setNewEntry({ website: "", username: "", password: "" });
  }

  async function handleDelete(id) {
    await deleteEntry(id);
    loadEntries();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    await updateEntry(editingEntry.id, editingEntry);
    setEditingEntry(null);
    loadEntries();
  }

  function handleCopy(password) {
    if (!password) return alert("No password to copy");
    navigator.clipboard?.writeText(password)
      .then(() => alert("Password copied to clipboard"))
      .catch(() => alert("Copy failed"));
  }

   // Reveal password for a single entry
  async function handleReveal(entryId) {
    if (!entryId) return;
    setRevealing(prev => ({ ...prev, [entryId]: true }));

    try{
      const data = await getEntryById(entryId); // GET /entries/{id}
      setEntries(prev =>
        prev.map(it =>
          it.id === entryId ? { ...it, password: data.password, _revealed: true } : it
        )
      );
    } catch (err) {
      alert("Unable to reveal password: " + err.message);
    } finally {
      setRevealing(prev => ({ ...prev, [entryId]: false }));
    }
  }

  return (
    <div className="text-[#FFFFFF] w-[960px] mx-auto flex flex-col gap-10" >
      <h1 className="text-[2rem] mx-auto">Manage Password</h1>
      
      <div className="flex flex-row gap-10 justify-between">
           {/* ---------------- Add Form ---------------- */}
      <form className="flex flex-col gap-[16px] w-[40%]" onSubmit={handleAdd}>
      <h3>Add Password</h3>
        <input 
          className="px-[16px] py-[12px] bg-[#1A2633] rounded-md text-white"
          required 
          
          pattern=".*\.com$" 
          placeholder="Website"
          value={newEntry.website}
          onChange={(e) => setNewEntry({ ...newEntry, website: e.target.value })}
        />
        <input 
          className="px-[16px] py-[12px] bg-[#1A2633] rounded-md text-white"
          required
          pattern=".*\S.*"
          placeholder="Username"
          value={newEntry.username}
          onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
        />
        <input 
          className="px-[16px] py-[12px] bg-[#1A2633] rounded-md text-white"
          required
          pattern=".*\S.*"
          placeholder="Password"
          type="password"
          value={newEntry.password}
          onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
        />
        <button type="submit" className="w-[40%] mx-auto px-1 py-2 rounded-md bg-[#1A80E5] text-[#FFFFFF]">Add</button>
      </form>

      {/* ---------------- Update Form ---------------- */}
      {editingEntry && (
        <form
         className="flex flex-col gap-[16px] w-[40%] bg-[#121417] "
          onSubmit={handleUpdate}
          
        >
          <h3>Editing Entry</h3>
          <input
            required
            pattern=".*\.com$" 
          
          className="px-1 py-3 bg-[#1A2633] rounded-md text-white"
            placeholder="Website"
            value={editingEntry.website}
            onChange={(e) => setEditingEntry({ ...editingEntry, website: e.target.value })}
          />
          <input
          className="px-1 py-3 bg-[#1A2633] rounded-md text-white"
            required
            pattern=".*\S.*"
            placeholder="Username"
            value={editingEntry.username}
            onChange={(e) => setEditingEntry({ ...editingEntry, username: e.target.value })}
          />
          <input
          className="px-1 py-3 bg-[#1A2633] rounded-md text-white"
           required
          pattern=".*\S.*"
            placeholder="Password"
            type="password"
            value={editingEntry.password || ""}
            onChange={(e) => setEditingEntry({ ...editingEntry, password: e.target.value })}
          />
          <div className="flex gap-3">
            <button type="submit" className="w-[40%] mx-auto px-1 py-2 rounded-md bg-[#1A80E5] text-[#FFFFFF]">Update</button>
            <button type="button" className="w-[40%] mx-auto px-1 py-2 rounded-md bg-[#1A80E5] text-[#FFFFFF]" onClick={() => setEditingEntry(null)}>Cancel</button>
          </div>
          
        </form>
      )}
      </div>
     

      {/* ---------------- List Entries Button ---------------- */}
     <button 
       className=" mx-auto px-4 py-2 rounded-md bg-[#1A80E5] text-[#FFFFFF]"
        onClick={()=>{
        if(!showEntries) loadEntries();
         setShowEntries((prev)=>!prev);
     }}>
        {showEntries?"Hide Entries":"List Entries"}
     </button>


      {/* ---------------- Entries Table ---------------- */}
      {showEntries && entries.length > 0 && (
        <table className="border border-[3D4754] rounded-md" cellPadding="5">
          <thead className="border-b border-[3D4754] text-left bg-[#1C2126]">
             <tr>
              <th>Website</th>
              <th>Username</th>
              <th>Created At</th>
              <th>Action</th>
             </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-[3D4754]">
                <td>{e.website}</td>
                <td>{e.username}</td>
                <td>{new Date(e.created_at).toLocaleString()}</td>
              
                <td className="flex gap-3">
                  <button onClick={() => handleDelete(e.id)}>Delete</button> 
                   <div>|</div>

                  <button onClick={() => setEditingEntry(e)}>Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showEntries && entries.length === 0 && (
        <p>No entries found.</p>
      )}


      <button className="mx-auto px-3 py-2 rounded-md bg-[#1A80E5] text-[#FFFFFF]" onClick={()=>setShowPasswords(p=>!p)}>
        Show Passwords
      </button>
      {showPasswords &&(
           <main style={{ padding: 20 }}>
      <h1>PassManager</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {entries.map(entry => (
          <li
            key={entry.id}
            style={{
              padding: 12,
              borderBottom: "1px solid #eee",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 8
            }}
          >
            <div>
              <div>
                <strong>{entry.website}</strong> — <small>{entry.username}</small>
              </div>
              <div className="text-black" style={{ marginTop: 6 }}>
                <code style={{ padding: "6px 8px", borderRadius: 6, background: "#f6f6f6",text:"#000" }}>
                  {entry._revealed ? entry.password : "••••••••"}
                </code>
                <small style={{ marginLeft: 8, color: "#666" }}>{entry.created_at || ""}</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleReveal(entry.id)} disabled={revealing[entry.id]}>
                {entry._revealed
                  ? "Revealed"
                  : revealing[entry.id]
                  ? "Revealing..."
                  : "Reveal"}
              </button>
              <button onClick={() => handleCopy(entry.password)} disabled={!entry._revealed}>
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
      )}
      
    </div>
  )
}
