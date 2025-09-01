import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

type LoginForm = z.infer<typeof loginSchema>

export default function Login(){
  const nav = useNavigate()
  const [loginError, setLoginError] = useState('')
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onLogin = async (v:LoginForm)=>{
    setLoginError('')
    try {
      await api.post('/api/auth/login', v)
      nav('/')
    } catch(e:any) {
      setLoginError('invalid account or password')
    }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #232526 0%, #414345 100%)', fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>
      <form onSubmit={loginForm.handleSubmit(onLogin)} style={{
        width: 360,
        padding: '32px 28px',
        borderRadius: 18,
        boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
        background: '#222',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        border: '1px solid #444',
        marginTop: 60
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 18, color: '#fff', letterSpacing: 4, fontWeight: 900, fontSize: 32, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #111' }}>Tick Board</h2>
        {loginError && <p style={{ color: '#ff3b3b', fontSize: 15, margin: 0, textAlign: 'center', fontWeight: 700 }}>{loginError}</p>}
        <label style={{ fontWeight: 600, marginBottom: 4, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Email</label>
        <input 
          placeholder="Input email" 
          {...loginForm.register('email')} 
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            fontSize: 16,
            background: '#333',
            color: '#fff',
            marginBottom: 2,
            fontWeight: 500,
            fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif'
          }}
        />
        {loginForm.formState.errors.email && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{loginForm.formState.errors.email.message}</p>}
        <label style={{ fontWeight: 600, marginBottom: 4, marginTop: 8, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Password</label>
        <input 
          type="password" 
          placeholder="Input password" 
          {...loginForm.register('password')} 
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            fontSize: 16,
            background: '#333',
            color: '#fff',
            marginBottom: 2,
            fontWeight: 500,
            fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif'
          }}
        />
        {loginForm.formState.errors.password && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{loginForm.formState.errors.password.message}</p>}
        <button 
          disabled={loginForm.formState.isSubmitting}
          style={{
            marginTop: 18,
            padding: '12px 0',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(90deg, #444 0%, #232526 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 17,
            cursor: loginForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            letterSpacing: 1,
            fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif',
            transition: 'background 0.2s'
          }}
        >{loginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}</button>
        <button type="button" onClick={()=>nav('/register')} style={{ marginTop: 8, background: 'none', border: 'none', color: '#bbb', fontWeight: 600, fontSize: 15, cursor: 'pointer', textDecoration: 'underline' }}>Sign up</button>
      </form>
    </div>
  )
}