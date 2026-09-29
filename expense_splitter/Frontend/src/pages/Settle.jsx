import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiHome, FiUsers, FiDollarSign, FiCreditCard, FiLogOut, FiSave, FiRefreshCw } from "react-icons/fi"
import { GiArtificialHive } from "react-icons/gi"
import api from "../utils/axios"

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })

function Settle({ user, setuser }) {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [groupId, setGroupId] = useState("")
  const [members, setMembers] = useState([])
  const [amounts, setAmounts] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const total = useMemo(() => members.reduce((sum, member) => sum + (Number(amounts[member.userId]) || 0), 0), [members, amounts])
  const share = members.length ? total / members.length : 0

  const loadGroupSummary = async (id) => {
    if (!id) return
    const response = await api.get(`/api/groups/${id}/settlements`)
    const rows = response.data.members || []
    setMembers(rows)
    setAmounts(Object.fromEntries(rows.map((member) => [member.userId, String(member.contribution ?? 0)])))
    setResult(response.data)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const response = await api.get("/api/groups")
        const rows = response.data.groups || []
        setGroups(rows)
        if (rows.length) setGroupId(String(rows[0].id))
      } catch (err) {
        if (err?.response?.status === 401) { setuser(null); navigate("/") }
        else setError(err?.response?.data?.error || "Couldn't load your groups.")
      } finally { setLoading(false) }
    }
    init()
  }, [])

  useEffect(() => {
    if (!groupId) { setMembers([]); setResult(null); return }
    setLoading(true)
    setError("")
    loadGroupSummary(groupId)
      .catch((err) => {
        if (err?.response?.status === 401) { setuser(null); navigate("/") }
        else setError(err?.response?.data?.error || "Couldn't load group contributions.")
      })
      .finally(() => setLoading(false))
  }, [groupId])

  const saveContributions = async () => {
    setSaving(true); setError(""); setNotice("")
    try {
      const contributions = members.map((member) => ({
        userId: member.userId,
        amount: amounts[member.userId] === "" ? 0 : Number(amounts[member.userId]),
      }))
      const response = await api.post(`/api/groups/${groupId}/settlements`, { contributions })
      setMembers(response.data.members || [])
      setAmounts(Object.fromEntries((response.data.members || []).map((member) => [member.userId, String(member.contribution)])))
      setResult(response.data)
      setNotice("Contributions saved. The total has been divided equally among the group.")
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't save contributions.")
    } finally { setSaving(false) }
  }

  const handleLogout = async () => {
    try { await api.post("/logout") } finally { setuser(null); navigate("/") }
  }

  const navItems = [
    { label: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { label: "Groups", icon: <FiUsers />, path: "/groups" },
    { label: "Expenses", icon: <FiDollarSign />, path: "/expenses" },
    { label: "Settle Up", icon: <FiCreditCard />, path: "/settle" },
  ]

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex font-sans">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#F8F9FA] border-r border-black/8 flex-col p-4 z-20">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center"><GiArtificialHive color="white" /></div>
          <span className="font-extrabold">SplitEase</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${item.path === "/settle" ? "bg-black/8 font-semibold" : "text-black/55 hover:bg-black/5"}`}>{item.icon}{item.label}</button>)}
        </nav>
        <div className="border-t border-black/10 pt-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold">{user?.username?.[0]?.toUpperCase() || "U"}</div>
          <span className="text-xs font-medium flex-1 truncate">{user?.username}</span>
          <button onClick={handleLogout} title="Log out" className="text-black/45 hover:text-red-500"><FiLogOut /></button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 px-4 sm:px-6 py-6 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-black/40 mb-1">Group expenses</p>
            <h1 className="text-2xl font-bold">Settle Up</h1>
            <p className="text-sm text-black/50 mt-1">Enter how much each member contributed. Split the combined total equally.</p>
          </div>
          <button onClick={() => loadGroupSummary(groupId).catch(() => setError("Couldn't refresh contributions."))} disabled={!groupId || loading} className="inline-flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-40"><FiRefreshCw /> Refresh</button>
        </div>

        <section className="bg-[#F8F9FA] border border-black/8 rounded-2xl p-4 sm:p-5 mb-5">
          <label className="block text-xs font-semibold text-black/55 mb-2" htmlFor="settle-group">Choose a group</label>
          {groups.length ? <select id="settle-group" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full sm:max-w-md bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black/30">{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select> : !loading ? <p className="text-sm text-black/50">You are not a member of any groups yet. Create a group first.</p> : null}
        </section>

        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3">{notice}</div>}

        {loading ? <p className="py-8 text-sm text-black/40">Loading members...</p> : members.length > 0 && <>
          <section className="border border-black/8 rounded-2xl overflow-hidden mb-5">
            <div className="p-4 sm:p-5 border-b border-black/8">
              <h2 className="font-bold">Member contributions</h2>
              <p className="text-xs text-black/45 mt-1">Enter the amount paid by each member. You can enter all amounts while logged in as one user.</p>
            </div>
            <div className="divide-y divide-black/5">
              {members.map((member) => <div key={member.userId} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{member.username}{member.userId === user?.id ? <span className="text-xs text-black/40 font-normal"> (you)</span> : ""}</p><p className="text-xs text-black/40">Amount contributed</p></div>
                <div className="relative w-full sm:w-56"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">₹</span><input aria-label={`Contribution by ${member.username}`} type="number" min="0" step="0.01" value={amounts[member.userId] ?? ""} onChange={(e) => { setAmounts((prev) => ({ ...prev, [member.userId]: e.target.value })); setNotice("") }} className="w-full bg-[#F8F9FA] border border-black/10 rounded-lg pl-8 pr-3 py-2.5 text-sm outline-none focus:border-black/30" placeholder="0.00" /></div>
              </div>)}
            </div>
            <div className="bg-[#F8F9FA] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><p className="text-xs text-black/45">Total contributed</p><p className="text-2xl font-bold">{currency(total)}</p></div>
              <div><p className="text-xs text-black/45">Equal share per member</p><p className="text-xl font-bold">{currency(share)}</p></div>
              <button onClick={saveContributions} disabled={saving || members.some((m) => Number(amounts[m.userId]) < 0 || amounts[m.userId] === "")} className="inline-flex items-center justify-center gap-2 bg-black text-white rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-40"><FiSave /> {saving ? "Saving..." : "Save & calculate"}</button>
            </div>
          </section>

          {result && <section className="mb-6">
            <h2 className="font-bold text-lg mb-3">Final split</h2>
            <p className="text-xs text-black/45 mb-3">Each member's contribution is compared with their equal share. Positive balance means they receive money; negative means they pay.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((member) => {
                const current = Number(amounts[member.userId] || 0)
                const balance = current - (members.length ? total / members.length : 0)
                return <div key={member.userId} className="border border-black/8 rounded-xl p-4">
                  <p className="font-semibold text-sm">{member.username}</p>
                  <div className="mt-2 flex justify-between text-xs text-black/45"><span>Contributed {currency(current)}</span><span>Share {currency(share)}</span></div>
                  <p className={`mt-3 text-sm font-bold ${balance > 0.004 ? "text-emerald-600" : balance < -0.004 ? "text-red-500" : "text-black/50"}`}>{Math.abs(balance) < 0.005 ? "Settled" : balance > 0 ? `Receives ${currency(balance)}` : `Pays ${currency(-balance)}`}</p>
                </div>
              })}
            </div>
            {result.suggestedTransfers?.length > 0 && <div className="mt-4 rounded-xl bg-[#F8F9FA] p-4"><h3 className="font-semibold text-sm mb-2">Suggested transfers</h3>{result.suggestedTransfers.map((t, i) => <p key={i} className="text-sm py-1">{t.fromUsername} pays <b>{t.toUsername}</b> {currency(t.amount)}</p>)}</div>}
          </section>}
        </>}
      </main>
    </div>
  )
}

export default Settle
