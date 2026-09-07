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
  FiSearch,
  FiPlus,
  FiChevronDown,
} from 'react-icons/fi'
import { GiArtificialHive } from "react-icons/gi"

function Expenses({ user, setuser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [moblieOpen, setMoblieOpen] = useState(false)

  const [expenses, setExpenses] = useState([])
  const [groups, setGroups] = useState([])

  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState("all")
  const [filterOpen, setFilterOpen] = useState(false)

  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  const navigate = useNavigate()

  // --------------------------------------------------
  // Fetch expenses + groups
  // --------------------------------------------------

  const fetchData = async () => {
    try {
      const [expensesRes, groupsRes] = await Promise.all([
        api.get("/api/expenses"),
        api.get("/api/groups"),
      ])

      setExpenses(expensesRes.data.expenses || [])
      setGroups(groupsRes.data.groups || [])
    } catch (error) {
      console.log(error)

      if (error?.response?.status === 401) {
        setuser(null)
        navigate("/")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      const response = await api.post("/logout")

      if (response.data.success) {
        setuser(null)
        navigate("/")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // --------------------------------------------------
  // Create Expense
  // --------------------------------------------------

  const handleCreateExpense = async () => {
    setCreateError("")

    if (!description.trim()) {
      setCreateError("Description is required")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setCreateError("Enter a valid amount")
      return
    }

    if (!selectedGroup) {
      setCreateError("Please select a group")
      return
    }

    setCreating(true)

    try {
      const response = await api.post("/api/expenses", {
        description: description.trim(),
        amount: Number(amount),
        groupId: Number(selectedGroup),
      })

      if (response.data.success) {
        const newExpense = response.data.expense

        setExpenses((prev) => [newExpense, ...prev])

        setDescription("")
        setAmount("")
        setSelectedGroup("")
        setCreateError("")
        setShowCreate(false)

        // Refresh groups because group balance / total changes.
        const groupsRes = await api.get("/api/groups")
        setGroups(groupsRes.data.groups || [])
      }
    } catch (error) {
      console.log(error)

      if (error?.response?.status === 401) {
        setuser(null)
        navigate("/")
        return
      }

      setCreateError(
        error?.response?.data?.error ||
        "Couldn't create the expense"
      )
    } finally {
      setCreating(false)
    }
  }

  // --------------------------------------------------
  // Close modal
  // --------------------------------------------------

  const closeCreateModal = () => {
    if (creating) return

    setShowCreate(false)
    setDescription("")
    setAmount("")
    setSelectedGroup("")
    setCreateError("")
  }

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  const filteredExpenses = expenses
    .filter(
      (expense) =>
        groupFilter === "all" ||
        String(expense.group?.id) === String(groupFilter)
    )
    .filter((expense) =>
      expense.description
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )

  const formatDate = (dateStr) => {
    if (!dateStr) return ""

    const date = new Date(dateStr)

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const activeGroupName =
    groupFilter === "all"
      ? "All Groups"
      : groups.find(
          (group) => String(group.id) === String(groupFilter)
        )?.name || "All Groups"

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const navItems = [
    {
      label: "Dashboard",
      icon: <FiHome />,
      path: "/dashboard",
    },
    {
      label: "Groups",
      icon: <FiUsers />,
      path: "/groups",
    },
    {
      label: "Expenses",
      icon: <FiDollarSign />,
      path: "/expenses",
    },
    {
      label: "Settle Up",
      icon: <FiCreditCard />,
      path: "/settle",
    },
  ]

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className='bg-white min-h-screen text-[#0A0A0A] font-sans flex'>

      {/* ----------------------------------------------- */}
      {/* Desktop Sidebar */}
      {/* ----------------------------------------------- */}

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
          className={`flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 mb-6 shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all ${sidebarOpen ? "px-3 justify-start" : "justify-center px-0"}`}
        >
          <FiPlus size={16} />

          {sidebarOpen && (
            <span className="text-xs">
              New Expense
            </span>
          )}
        </motion.button>

        <nav className='flex-1 flex flex-col gap-1'>
          {navItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ x: sidebarOpen ? 2 : 0 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all ${item.path === "/expenses"
                ? "bg-black/8 text-[#0A0A0A]"
                : "text-black/55 hover:text-[#0A0A0A] hover:bg-black/5"
                } ${sidebarOpen ? "px-3" : "justify-center px-0"}`}
            >
              <span className='text-base'>
                {item.icon}
              </span>

              {sidebarOpen && (
                <span>
                  {item.label}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className={`flex items-center gap-2 pt-3 border-t border-black/8 ${sidebarOpen ? "px-2" : "justify-center"}`}>
          <div className='w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/60 shrink-0'>
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>

          {sidebarOpen && (
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-semibold text-[#0A0A0A] truncate'>
                {user?.username}
              </p>
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

      {/* ----------------------------------------------- */}
      {/* Mobile Sidebar */}
      {/* ----------------------------------------------- */}

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

                <button
                  onClick={() => setMoblieOpen(false)}
                  className='text-black/40'
                >
                  <FiX size={18} />
                </button>
              </div>

              <button
                onClick={() => {
                  setShowCreate(true)
                  setMoblieOpen(false)
                }}
                className='flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 px-3 mb-6 text-xs'
              >
                <FiPlus size={16} />
                New Expense
              </button>

              <nav className='flex-1 flex flex-col gap-1'>
                {navItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(item.path)
                      setMoblieOpen(false)
                    }}
                    className={`flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${item.path === "/expenses"
                      ? "bg-black/8 text-[#0A0A0A]"
                      : "text-black/55 hover:text-[#0A0A0A] hover:bg-black/5"
                      }`}
                  >
                    <span className='text-base'>
                      {item.icon}
                    </span>

                    <span>
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>

              <div className='flex items-center gap-2 pt-3 px-2 border-t border-black/8'>
                <div className='w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/60'>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>

                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-semibold text-[#0A0A0A] truncate'>
                    {user?.username}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className='text-black/40 hover:text-red-500'
                >
                  <FiLogOut size={15} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------- */}
      {/* Main Content */}
      {/* ----------------------------------------------- */}

      <motion.main
        className={`flex-1 min-h-screen px-3 sm:px-4 md:px-6 py-4 md:py-6 transition-all duration-300 ${sidebarOpen ? "md:ml-[260px]" : "md:ml-[72px]"}`}
      >

        {/* Header */}

        <div className='flex items-center justify-between mb-5 md:mb-6'>
          <div className='flex items-center gap-2.5'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMoblieOpen(true)}
              className='md:hidden text-black/40 hover:text-[#0A0A0A] transition-colors'
            >
              <FiSidebar size={17} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className='text-black/40 text-[11px] md:text-xs font-medium mb-0.5'>
                Overview
              </p>

              <h2 className='text-lg md:text-xl font-bold text-[#0A0A0A]'>
                All Expenses
              </h2>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className='hidden sm:flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg px-3.5 py-2 text-xs shadow-[0_6px_20px_rgba(0,0,0,0.2)]'
          >
            <FiPlus size={14} />
            New Expense
          </motion.button>
        </div>

        <div className='h-px bg-black/8 mb-5 md:mb-6' />

        {/* Search + Filter */}

        <div className='flex flex-col sm:flex-row gap-2.5 mb-5 md:mb-6'>
          <div className='relative flex-1 max-w-sm'>
            <FiSearch
              className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30'
              size={14}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg pl-9 pr-3 py-2 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors'
            />
          </div>

          <div className='relative'>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className='flex items-center gap-2 bg-[#F8F9FA] border border-black/8 rounded-lg px-3 py-2 text-xs text-[#0A0A0A] font-medium hover:border-black/20 transition-colors'
            >
              {activeGroupName}

              <FiChevronDown
                size={13}
                className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setFilterOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className='absolute left-0 mt-1.5 w-44 bg-white border border-black/8 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-1 z-20'
                  >
                    <button
                      onClick={() => {
                        setGroupFilter("all")
                        setFilterOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-black/5 transition-colors ${groupFilter === "all"
                        ? "font-semibold text-[#0A0A0A]"
                        : "text-black/60"
                        }`}
                    >
                      All Groups
                    </button>

                    {groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setGroupFilter(group.id)
                          setFilterOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-black/5 transition-colors truncate ${String(groupFilter) === String(group.id)
                          ? "font-semibold text-[#0A0A0A]"
                          : "text-black/60"
                          }`}
                      >
                        {group.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* Expense List */}
        {/* ----------------------------------------------- */}

        {loading ? (
          <div className='text-black/30 text-xs'>
            Loading expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3'>
              <FiDollarSign
                className='text-black/30'
                size={20}
              />
            </div>

            <p className='text-[#0A0A0A] font-semibold text-sm mb-1'>
              No expenses found
            </p>

            <p className='text-black/40 text-xs mb-4'>
              {search || groupFilter !== "all"
                ? "Try a different search or filter."
                : "Log an expense in a group to see it here."}
            </p>

            <button
              onClick={() => setShowCreate(true)}
              className='flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg px-4 py-2 text-xs'
            >
              <FiPlus size={14} />
              New Expense
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            {filteredExpenses.map((expense, i) => {
              const isPaidByUser =
                expense.paidBy?.username === user?.username

              return (
                <motion.div
                  key={expense.id || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className='flex items-center justify-between bg-[#F8F9FA] border border-black/8 rounded-xl px-4 py-3 hover:border-black/15 transition-colors'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-9 h-9 rounded-lg bg-[#0A0A0A] flex items-center justify-center text-white shrink-0'>
                      <FiDollarSign size={14} />
                    </div>

                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-[#0A0A0A] truncate'>
                        {expense.description}
                      </p>

                      <p className='text-[11px] text-black/40 truncate'>
                        {expense.group?.name}
                        {" · "}
                        Paid by {isPaidByUser ? "you" : expense.paidBy?.username}
                        {" · "}
                        {formatDate(expense.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className='text-right shrink-0 ml-3'>
                    <p className='text-sm font-bold text-[#0A0A0A]'>
                      ₹{Number(expense.amount).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

      </motion.main>

      {/* ----------------------------------------------- */}
      {/* Create Expense Modal */}
      {/* ----------------------------------------------- */}

      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCreateModal}
              className='fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]'
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-5 z-[70]'
            >

              <div className='flex items-start justify-between mb-5'>
                <div>
                  <h3 className='font-bold text-sm text-[#0A0A0A]'>
                    Add Expense
                  </h3>

                  <p className='text-[11px] text-black/40 mt-1'>
                    Add a shared expense to one of your groups.
                  </p>
                </div>

                <button
                  onClick={closeCreateModal}
                  disabled={creating}
                  className='text-black/40 hover:text-[#0A0A0A] disabled:opacity-30'
                >
                  <FiX size={16} />
                </button>
              </div>

              <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner"
                disabled={creating}
                className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg px-3 py-2.5 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 mb-4 transition-colors disabled:opacity-50'
              />

              <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1200"
                disabled={creating}
                className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg px-3 py-2.5 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 mb-4 transition-colors disabled:opacity-50'
              />

              <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>
                Group
              </label>

              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={creating}
                className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg px-3 py-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-black/20 mb-4 transition-colors disabled:opacity-50'
              >
                <option value="">
                  Select a group
                </option>

                {groups.map((group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.name}
                  </option>
                ))}
              </select>

              {createError && (
                <p className='text-red-500 text-[11px] font-medium mb-3'>
                  {createError}
                </p>
              )}

              <motion.button
                whileHover={{ scale: creating ? 1 : 1.01 }}
                whileTap={{ scale: creating ? 1 : 0.98 }}
                onClick={handleCreateExpense}
                disabled={creating || groups.length === 0}
                className='w-full bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-opacity'
              >
                {creating ? "Adding..." : "Add Expense"}
              </motion.button>

              {groups.length === 0 && (
                <p className='text-center text-[10px] text-black/35 mt-2'>
                  Create a group before adding an expense.
                </p>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Expenses