import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(2) })
type RegisterForm = z.infer<typeof registerSchema>

export default function Register(){
  const nav = useNavigate()
  const [registerError, setRegisterError] = useState('')
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onRegister = async (v:RegisterForm)=>{
    setRegisterError('')
    try {
      await api.post('/api/auth/register', v)
      nav('/login')
    } catch(e:any) {
      setRegisterError(e?.response?.data?.message || 'register failed')
    }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #232526 0%, #414345 100%)', fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>
      <form onSubmit={registerForm.handleSubmit(onRegister)} style={{
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
        {registerError && <p style={{ color: '#ff3b3b', fontSize: 15, margin: 0, textAlign: 'center', fontWeight: 700 }}>{registerError}</p>}
        <label style={{ fontWeight: 600, marginBottom: 4, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Email</label>
        <input 
          placeholder="Input email" 
          {...registerForm.register('email')} 
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
        {registerForm.formState.errors.email && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{registerForm.formState.errors.email.message}</p>}
        <label style={{ fontWeight: 600, marginBottom: 4, marginTop: 8, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Password</label>
        <input 
          type="password" 
          placeholder="Input password" 
          {...registerForm.register('password')} 
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
        {registerForm.formState.errors.password && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{registerForm.formState.errors.password.message}</p>}
        <label style={{ fontWeight: 600, marginBottom: 4, marginTop: 8, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Name</label>
        <input 
          placeholder="Input name" 
          {...registerForm.register('name')} 
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
        {registerForm.formState.errors.name && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{registerForm.formState.errors.name.message}</p>}
        <button 
          disabled={registerForm.formState.isSubmitting}
          style={{
            marginTop: 18,
            padding: '12px 0',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(90deg, #444 0%, #232526 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 17,
            cursor: registerForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            letterSpacing: 1,
            fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif',
            transition: 'background 0.2s'
          }}
        >{registerForm.formState.isSubmitting ? 'Registering...' : 'Register'}</button>
        <button type="button" onClick={()=>nav('/login')} style={{ marginTop: 8, background: 'none', border: 'none', color: '#bbb', fontWeight: 600, fontSize: 15, cursor: 'pointer', textDecoration: 'underline' }}>Return to login</button>
      </form>
    </div>
  )
}
