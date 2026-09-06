import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/axios'
import { motion, AnimatePresence } from "motion/react"
import {
  FiSidebar,
  FiHome,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiLogOut,
  FiX,
  FiPlus,
  FiSearch,
  FiChevronRight,
} from 'react-icons/fi'
import { GiArtificialHive } from "react-icons/gi";

function Groups({ user, setuser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [moblieOpen, setMoblieOpen] = useState(false)

  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [memberEmails, setMemberEmails] = useState([])
  const [creating, setCreating] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/api/groups")
        setGroups(response.data.groups || [])
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/auth/logout")

      if (response.data.success) {
        setuser(null)
        navigate("/")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const navItems = [
    { label: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { label: "Groups", icon: <FiUsers />, path: "/groups" },
    { label: "Expenses", icon: <FiDollarSign />, path: "/expenses" },
    { label: "Settle Up", icon: <FiCreditCard />, path: "/settle" },
  ]

  const addMemberEmail = () => {
    const email = memberEmail.trim()
    if (!email) return
    if (memberEmails.includes(email)) {
      setMemberEmail("")
      return
    }
    setMemberEmails([...memberEmails, email])
    setMemberEmail("")
  }

  const removeMemberEmail = (email) => {
    setMemberEmails(memberEmails.filter((e) => e !== email))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return
    setCreating(true)
    try {
      const response = await api.post("/api/groups", {
        name: groupName.trim(),
        members: memberEmails,
      })

      if (response.data.success) {
        setGroups([response.data.group, ...groups])
        setShowCreate(false)
        setGroupName("")
        setMemberEmails([])
        setMemberEmail("")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setCreating(false)
    }
  }

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='bg-white min-h-screen text-[#0A0A0A] font-sans flex'>

      {/* Sidebar - desktop */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3 }}
        className='hidden md:flex fixed top-0 left-0 h-screen bg-[#F8F9FA] border-r border-black/8 flex-col py-5 px-3 z-40'
      >
        <div className={`flex items-center gap-2 mb-8 ${sidebarOpen ? "px-2" : "justify-center"}`}>
          <div className="w-8 h-8 shrink-0 rounded-lg bg-[#0A0A0A] flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            <GiArtificialHive size={16} color="white" />
          </div>
          {sidebarOpen && (
            <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
              SplitEase
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className={`flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 mb-6 shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all ${sidebarOpen ? "px-3 justify-start" : "justify-center px-0"
            }`}
        >
          <FiPlus size={16} />
          {sidebarOpen && <span className="text-xs">New Group</span>}
        </motion.button>

        <nav className='flex-1 flex flex-col gap-1'>
          {navItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ x: sidebarOpen ? 2 : 0 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all ${item.path === "/groups"
                  ? "bg-black/8 text-[#0A0A0A]"
                  : "text-black/55 hover:text-[#0A0A0A] hover:bg-black/5"
                } ${sidebarOpen ? "px-3" : "justify-center px-0"}`}
            >
              <span className='text-base'>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        <div className={`flex items-center gap-2 pt-3 border-t border-black/8 ${sidebarOpen ? "px-2" : "justify-center"}`}>
          <div className='w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/60 shrink-0'>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {sidebarOpen && (
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-semibold text-[#0A0A0A] truncate'>{user?.name}</p>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className='text-black/40 hover:text-red-500 transition-colors shrink-0'
          >
            <FiLogOut size={15} />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-black/10 shadow-md flex items-center justify-center text-black/40 hover:text-[#0A0A0A]'
        >
          <FiSidebar size={12} />
        </motion.button>
      </motion.aside>

      {/* Sidebar - mobile */}
      <AnimatePresence>
        {moblieOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoblieOpen(false)}
              className='fixed inset-0 bg-black/40 z-40 md:hidden'
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className='fixed top-0 left-0 h-screen w-[260px] bg-[#F8F9FA] border-r border-black/8 flex flex-col py-5 px-3 z-50 md:hidden'
            >
              <div className='flex items-center justify-between mb-8 px-2'>
                <div className='flex items-center gap-2'>
                  <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] flex items-center justify-center">
                    <GiArtificialHive size={16} color="white" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
                    SplitEase
                  </span>
                </div>
                <button onClick={() => setMoblieOpen(false)} className='text-black/40'>
                  <FiX size={18} />
                </button>
              </div>

              <button
                onClick={() => { setShowCreate(true); setMoblieOpen(false) }}
                className='flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 px-3 mb-6 text-xs'
              >
                <FiPlus size={16} /> New Group
              </button>

              <nav className='flex-1 flex flex-col gap-1'>
                {navItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(item.path); setMoblieOpen(false) }}
                    className={`flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${item.path === "/groups"
                        ? "bg-black/8 text-[#0A0A0A]"
                        : "text-black/55 hover:text-[#0A0A0A] hover:bg-black/5"
                      }`}
                  >
                    <span className='text-base'>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className='flex items-center gap-2 pt-3 px-2 border-t border-black/8'>
                <div className='w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/60'>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-semibold text-[#0A0A0A] truncate'>{user?.name}</p>
                </div>
                <button onClick={handleLogout} className='text-black/40 hover:text-red-500'>
                  <FiLogOut size={15} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.main className={`flex-1 min-h-screen px-3 sm:px-4 md:px-6 py-4 md:py-6 transition-all duration-300 ${sidebarOpen ? "md:ml-[260px]" : "md:ml-[72px]"
        }`}>

        {/* top Area */}
        <div className='flex items-center justify-between mb-5 md:mb-6 gap-3'>
          <div className='flex items-center gap-2.5'>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMoblieOpen(true)}
              className='md:hidden text-black/40 hover:text-[#0A0A0A] transition-colors'>
              <FiSidebar size={17} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className='text-black/40 text-[11px] md:text-xs font-medium mb-0.5'>Overview</p>
              <h2 className='text-lg md:text-xl font-bold text-[#0A0A0A]'>Your Groups</h2>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className='hidden sm:flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg px-3.5 py-2 text-xs shadow-[0_6px_20px_rgba(0,0,0,0.2)]'
          >
            <FiPlus size={14} /> New Group
          </motion.button>
        </div>

        <div className='h-px bg-black/8 mb-5 md:mb-6' />

        {/* search */}
        <div className='relative mb-5 md:mb-6 max-w-sm'>
          <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30' size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg pl-9 pr-3 py-2 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors'
          />
        </div>

        {/* groups grid */}
        {loading ? (
          <div className='text-black/30 text-xs'>Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3'>
              <FiUsers className='text-black/30' size={20} />
            </div>
            <p className='text-[#0A0A0A] font-semibold text-sm mb-1'>No groups yet</p>
            <p className='text-black/40 text-xs mb-4'>Create a group to start splitting expenses.</p>
            <button
              onClick={() => setShowCreate(true)}
              className='flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg px-4 py-2 text-xs'
            >
              <FiPlus size={14} /> New Group
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'>
            {filteredGroups.map((group, i) => {
              const balance = group.balance ?? 0
              return (
                <motion.button
                  key={group._id || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className='text-left bg-[#F8F9FA] border border-black/8 rounded-2xl p-4 hover:border-black/15 transition-all'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-sm'>
                      {group.name?.[0]?.toUpperCase() || "G"}
                    </div>
                    <FiChevronRight className='text-black/25 mt-2' size={16} />
                  </div>

                  <h3 className='font-bold text-sm text-[#0A0A0A] mb-1 truncate'>{group.name}</h3>
                  <p className='text-black/40 text-[11px] mb-3'>
                    {group.members?.length || 0} members · ₹{(group.totalExpenses || 0).toLocaleString()} total
                  </p>

                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold ${balance > 0
                      ? "bg-emerald-50 text-emerald-600"
                      : balance < 0
                        ? "bg-red-50 text-red-500"
                        : "bg-black/5 text-black/40"
                    }`}>
                    {balance > 0
                      ? `You are owed ₹${balance.toLocaleString()}`
                      : balance < 0
                        ? `You owe ₹${Math.abs(balance).toLocaleString()}`
                        : "Settled up"}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

      </motion.main>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className='fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]'
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-5 z-[70]'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-bold text-sm text-[#0A0A0A]'>Create Group</h3>
                <button onClick={() => setShowCreate(false)} className='text-black/40 hover:text-[#0A0A0A]'>
                  <FiX size={16} />
                </button>
              </div>

              <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Goa Trip, Roommates"
                className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg px-3 py-2.5 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 mb-4 transition-colors'
              />

              <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>Add Members (email)</label>
              <div className='flex gap-2 mb-2'>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMemberEmail())}
                  placeholder="friend@email.com"
                  className='flex-1 bg-[#F8F9FA] border border-black/8 rounded-lg px-3 py-2.5 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors'
                />
                <button
                  onClick={addMemberEmail}
                  className='shrink-0 w-9 h-9 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 transition-colors'
                >
                  <FiPlus size={15} />
                </button>
              </div>

              {memberEmails.length > 0 && (
                <div className='flex flex-wrap gap-1.5 mb-4'>
                  {memberEmails.map((email) => (
                    <span
                      key={email}
                      className='inline-flex items-center gap-1.5 bg-black/5 text-black/60 text-[11px] font-medium px-2.5 py-1 rounded-full'
                    >
                      {email}
                      <button onClick={() => removeMemberEmail(email)} className='hover:text-red-500'>
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: groupName.trim() ? 1.01 : 1 }}
                whileTap={{ scale: groupName.trim() ? 0.98 : 1 }}
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || creating}
                className='w-full bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-opacity'
              >
                {creating ? "Creating..." : "Create Group"}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Groups