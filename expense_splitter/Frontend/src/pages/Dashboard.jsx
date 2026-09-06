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
  FiArrowUpRight,
  FiArrowDownRight,
} from 'react-icons/fi'
import { GiArtificialHive } from "react-icons/gi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

function Dashboard({ user, setuser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [moblieOpen, setMoblieOpen] = useState(false)

  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    youAreOwed: 0,
    youOwe: 0,
  })

  const [chartData, setChartData] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/expense/dashboard")
        setStats(response.data.stats)
        setChartData(response.data.chartData)
      } catch (error) {
        console.log(error)
      }
    }

    fetchDashboard()
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

  const balance = (stats?.youAreOwed || 0) - (stats?.youOwe || 0)

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
          onClick={() => navigate("/groups/new")}
          className={`flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 mb-6 shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all ${sidebarOpen ? "px-3 justify-start" : "justify-center px-0"
            }`}
        >
          <FiPlus size={16} />
          {sidebarOpen && <span className="text-xs">New Expense</span>}
        </motion.button>

        <nav className='flex-1 flex flex-col gap-1'>
          {navItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ x: sidebarOpen ? 2 : 0 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-black/55 hover:text-[#0A0A0A] hover:bg-black/5 transition-all text-sm font-medium ${sidebarOpen ? "px-3" : "justify-center px-0"
                }`}
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
                onClick={() => { navigate("/groups/new"); setMoblieOpen(false) }}
                className='flex items-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 px-3 mb-6 text-xs'
              >
                <FiPlus size={16} /> New Expense
              </button>

              <nav className='flex-1 flex flex-col gap-1'>
                {navItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(item.path); setMoblieOpen(false) }}
                    className='flex items-center gap-3 rounded-lg py-2.5 px-3 text-black/55 hover:text-[#0A0A0A] hover:bg-black/5 transition-all text-sm font-medium'
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
        <div className='flex items-center justify-between mb-5 md:mb-6'>
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
              <h2 className='text-lg md:text-xl font-bold text-[#0A0A0A]'>Hello, {user?.name?.split(" ")[0]} 👋 </h2>
            </motion.div>
          </div>
        </div>

        <div className='h-px bg-black/8 mb-5 md:mb-6' />

        {/* Stat cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-3'>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            className='bg-[#F8F9FA] border border-black/8 rounded-2xl p-4'
          >
            <p className='text-black/40 text-[11px] font-medium mb-2'>Total Groups</p>
            <h3 className='text-2xl font-extrabold text-[#0A0A0A] mb-1'>{stats?.totalGroups}</h3>
            <p className='text-[11px] text-black/40'>
              <span className='text-[#0A0A0A]/70 font-semibold'>Active</span> Groups You're In
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className='bg-[#F8F9FA] border border-black/8 rounded-2xl p-4'
          >
            <p className='text-black/40 text-[11px] font-medium mb-2'>Total Expenses</p>
            <h3 className='text-2xl font-extrabold text-[#0A0A0A] mb-1'>₹{stats?.totalExpenses?.toLocaleString?.() ?? stats?.totalExpenses}</h3>
            <p className='text-[11px] text-black/40'>
              <span className='text-[#0A0A0A]/70 font-semibold'>All Time</span> Logged By You
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className='bg-[#F8F9FA] border border-black/8 rounded-2xl p-4'
          >
            <p className='text-black/40 text-[11px] font-medium mb-2'>You Are Owed</p>
            <h3 className='text-2xl font-extrabold text-emerald-600 mb-1 flex items-center gap-1'>
              <FiArrowDownRight size={18} />₹{stats?.youAreOwed?.toLocaleString?.() ?? stats?.youAreOwed}
            </h3>
            <p className='text-[11px] text-black/40'>
              <span className='text-emerald-600/80 font-semibold'>Pending</span> From Others
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className='bg-[#F8F9FA] border border-black/8 rounded-2xl p-4'
          >
            <p className='text-black/40 text-[11px] font-medium mb-2'>You Owe</p>
            <h3 className='text-2xl font-extrabold text-red-500 mb-1 flex items-center gap-1'>
              <FiArrowUpRight size={18} />₹{stats?.youOwe?.toLocaleString?.() ?? stats?.youOwe}
            </h3>
            <p className='text-[11px] text-black/40'>
              <span className='text-red-500/80 font-semibold'>Pending</span> To Others
            </p>
          </motion.div>

        </div>

        {/* net balance strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className='mt-3 md:mt-4 flex items-center justify-between bg-[#0A0A0A] rounded-2xl px-4 py-3.5'
        >
          <span className='text-white/50 text-xs font-medium'>Net Balance</span>
          <span className={`text-sm font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {balance >= 0 ? "+" : "-"}₹{Math.abs(balance).toLocaleString()}
          </span>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 mb-3 md:mb-4">
          <p className='text-black/40 text-[10px] font-semibold uppercase tracking-widest mb-1'>
            Spending
          </p>
          <h3 className='text-[#0A0A0A] font-bold text-sm md:text-base mb-3 md:mb-4'>Expense History</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className='bg-[#F8F9FA] border border-black/8 rounded-2xl p-4 h-[280px] md:h-[340px]'
        >
          {chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#0A0A0A" strokeWidth={2} fill="url(#paidGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className='w-full h-full flex items-center justify-center text-black/30 text-xs'>
              No expenses logged yet
            </div>
          )}
        </motion.div>

      </motion.main>

    </div>
  )
}

export default Dashboard