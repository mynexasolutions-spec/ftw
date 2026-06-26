import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  async function checkAdmin(currentUser) {
    if (!currentUser) {
      setIsAdmin(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', currentUser.id)
        .maybeSingle()
      if (error) {
        console.error("checkAdmin query error:", error)
        setIsAdmin(false)
      } else {
        setIsAdmin(data?.is_admin === true)
      }
    } catch (err) {
      console.error("checkAdmin catch error:", err)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      checkAdmin(currentUser).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      checkAdmin(currentUser)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  async function resetPasswordForEmail(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return data
  }

  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return data
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut, resetPasswordForEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
