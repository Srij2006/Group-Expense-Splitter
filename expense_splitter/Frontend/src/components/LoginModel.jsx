import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { FiX, FiUser, FiLock } from 'react-icons/fi'
import { FaArrowRight } from "react-icons/fa6";
import api from '../utils/axios'

const LoginModel = ({ onClose, setuser }) => {
  const [mode, setMode] = useState("login") // "login" | "signup"
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password) {
      setError("Please fill in both fields")
      return
    }

    setLoading(true)

    try {
      const url = mode === "login" ? "/login" : "/signup"

      const response = await api.post(url, {
        username: username.trim(),
        password: password
      })

      if (response.data.success) {
        setuser(response.data.user)
        onClose()
      } else {
        setError(response.data.error || "Something went wrong")
      }
    } catch (err) {
      console.error(err)

      setError(
        err?.response?.data?.error ||
        "Something went wrong, please try again"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center px-4'
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className='w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 relative'
        >
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-black/40 hover:text-[#0A0A0A] transition-colors'
          >
            <FiX size={18} />
          </button>

          <h2 className='text-lg font-bold text-[#0A0A0A] mb-1'>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className='text-black/40 text-xs mb-6'>
            {mode === "login"
              ? "Log in to keep tracking your shared expenses."
              : "Sign up to start splitting expenses with your groups."}
          </p>

          <form onSubmit={handleSubmit}>
            <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>Username</label>
            <div className='relative mb-4'>
              <FiUser className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30' size={14} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="username"
                className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors'
              />
            </div>

            <label className='text-[11px] font-medium text-black/50 mb-1.5 block'>Password</label>
            <div className='relative mb-2'>
              <FiLock className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30' size={14} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className='w-full bg-[#F8F9FA] border border-black/8 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#0A0A0A] placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors'
              />
            </div>

            {error && (
              <p className='text-red-500 text-[11px] font-medium mb-3 mt-2'>{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className='w-full mt-4 flex items-center justify-center gap-2 bg-[#0A0A0A] text-white font-semibold rounded-lg py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            >
              {loading
                ? "Please wait..."
                : mode === "login" ? "Log In" : "Sign Up"}
              {!loading && <FaArrowRight size={11} />}
            </motion.button>
          </form>

          <p className='text-center text-black/40 text-[11px] mt-5'>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }}
              className='text-[#0A0A0A] font-semibold hover:underline'
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModel