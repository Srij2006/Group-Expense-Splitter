import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { FiHome, FiUsers, FiDollarSign, FiCreditCard, FiLogOut, FiRefreshCw, FiCheckCircle } from "react-icons/fi"
import { GiArtificialHive } from "react-icons/gi"
import api from "../utils/axios"

function Settle({ user, setuser }) {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [groupId, setGroupId] = useState("")
  const [suggested, setSuggested] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyKey, setBusyKey] = useState("")

  const activeGroup = useMemo(
    () => groups.find((group) => String(group.id) === String(groupId)),
    [groups, groupId]
  )

  const loadGroups = async () => {
    const response = await api.get("/api/groups")
    const rows = response.data.groups || []
    setGroups(rows)
    if (!groupId && rows.length) setGroupId(String(rows[0].id))
  }

  const loadSettlements = async (id) => {
    if (!id) {
      setSuggested([])
      setHistory([])
      return
    }
    const response = await api.get(`/api/groups/${id}/settlements`)
    setSuggested(response.data.suggestedTransfers || [])
    setHistory(response.data.settlements || [])
  }

  useEffect(() => {
    const init = async () => {
      try {
        await loadGroups()
      } catch (err) {
        if (err?.response?.status === 401) {
          setuser(null)
          navigate("/")
        } else {
          setError(err?.response?.data?.error || "Couldn't load your groups.")
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError("")
    loadSettlements(groupId)
      .catch((err) => {
        if (err?.response?.status === 401) {
          setuser(null)
          navigate("/")
        } else {
          setError(err?.response?.data?.error || "Couldn't load settlement details.")
        }
      })
      .finally(() => setLoading(false))
  }, [groupId])

  const recordPayment = async (transfer) => {
    const key = `${transfer.fromUserId}-${transfer.toUserId}`
    setBusyKey(key)
    setError("")
    try {
      await api.post(`/api/groups/${groupId}/settlements`, {
        toUserId: transfer.toUserId,
        amount: transfer.amount,
      })
      await loadSettlements(groupId)
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't record this payment.")
    } finally {
      setBusyKey("")
    }
  }

  const handleLogout = async () => {
    try {
      await api.post("/logout")
    } finally {
      setuser(null)
      navigate("/")
    }
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
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${item.path === "/settle" ? "bg-black/8 font-semibold" : "text-black/55 hover:bg-black/5"}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-black/10 pt-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold">{user?.username?.[0]?.toUpperCase() || "U"}</div>
          <span className="text-xs font-medium flex-1 truncate">{user?.username}</span>
          <button onClick={handleLogout} title="Log out" className="text-black/45 hover:text-red-500"><FiLogOut /></button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 px-4 sm:px-6 py-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-black/40 mb-1">Payments</p>
            <h1 className="text-2xl font-bold">Settle up</h1>
            <p className="text-sm text-black/50 mt-1">See who owes whom and record payments between group members.</p>
          </div>
          <button onClick={() => { setLoading(true); loadSettlements(groupId).catch(() => setError("Couldn't refresh settlements.")).finally(() => setLoading(false)) }} disabled={!groupId || loading} className="inline-flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-40"><FiRefreshCw /> Refresh</button>
        </div>

        <section className="bg-[#F8F9FA] border border-black/8 rounded-2xl p-4 sm:p-5 mb-5">
          <label className="block text-xs font-semibold text-black/55 mb-2" htmlFor="settle-group">Choose a group</label>
          {groups.length ? (
            <select id="settle-group" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full sm:max-w-md bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black/30">
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
          ) : !loading ? <p className="text-sm text-black/50">You are not a member of any groups yet. Create a group first.</p> : null}
          {activeGroup && <p className="text-xs text-black/45 mt-2">{activeGroup.members?.length || 0} members · ₹{Number(activeGroup.totalExpenses || 0).toLocaleString("en-IN")} total expenses</p>}
        </section>

        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3">{error}</div>}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Suggested payments</h2>
            <span className="text-xs text-black/40">Based on equal expense split</span>
          </div>
          {loading ? <p className="text-sm text-black/40 py-8">Loading settlement details...</p> :
            suggested.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center">
                <FiCheckCircle className="mx-auto text-emerald-600 mb-2" size={24} />
                <p className="font-semibold text-sm">Everyone is settled up</p>
                <p className="text-xs text-black/45 mt-1">There are no outstanding transfers for this group.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggested.map((transfer) => {
                  const key = `${transfer.fromUserId}-${transfer.toUserId}`
                  const isPayer = transfer.fromUserId === user?.id
                  return (
                    <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-black/8 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-white">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{transfer.fromUsername} <span className="text-black/35 font-normal">pays</span> {transfer.toUsername}</p>
                        <p className="text-xs text-black/45 mt-1">{isPayer ? "You need to pay this amount." : transfer.toUserId === user?.id ? "You should receive this amount." : "Payment between group members."}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-lg font-bold tabular-nums">₹{Number(transfer.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      {isPayer && <button onClick={() => recordPayment(transfer)} disabled={!!busyKey} className="rounded-lg bg-black text-white text-xs font-semibold px-4 py-2.5 hover:bg-black/80 disabled:opacity-40">{busyKey === key ? "Recording..." : "Record payment"}</button>}
                    </motion.div>
                  )
                })}
              </div>
            )}
        </section>

        <section>
          <h2 className="font-bold text-lg mb-3">Payment history</h2>
          {history.length === 0 ? <div className="rounded-xl bg-[#F8F9FA] p-5 text-sm text-black/45">No payments have been recorded for this group yet.</div> : (
            <div className="border border-black/8 rounded-xl divide-y divide-black/5">
              {history.map((item) => <div key={item.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                <div><p className="text-sm font-medium">{item.paidBy.username} paid {item.receivedBy.username}</p><p className="text-xs text-black/40 mt-1">{new Date(item.createdAt).toLocaleString("en-IN")}</p></div>
                <p className="font-bold">₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Settle
