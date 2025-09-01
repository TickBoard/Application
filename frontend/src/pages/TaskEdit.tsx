import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '../lib/api'

type Form = {
  title: string
  status: 'todo' | 'in-progress' | 'done'
  memo?: string
}

export default function TaskEdit(){
  const { id } = useParams()
  const nav = useNavigate()
  const task = useQuery({ queryKey: ['task', id], queryFn: async ()=> (await api.get(`/api/tasks/${id}`)).data })
  const { register, handleSubmit, reset, formState:{ errors }, setError } = useForm<Form>()

  React.useEffect(()=>{
    if (task.data) reset({ title: task.data.title, status: task.data.status, memo: task.data.memo })
  }, [task.data, reset])

  const save = useMutation({
    mutationFn: async (v:Form)=> (await api.patch(`/api/tasks/${id}`, v)).data,
    onSuccess: ()=> nav('/')
  })
  const del = useMutation({
    mutationFn: async ()=> (await api.delete(`/api/tasks/${id}`)).data,
    onSuccess: ()=> nav('/')
  })

  const onSubmit = (data: Form) => {
    if (!data.title || data.title.trim().length === 0) {
      setError('title', { type: 'manual', message: 'Title is required' })
      return
    }
    if (!['todo', 'in-progress', 'done'].includes(data.status)) {
      setError('status', { type: 'manual', message: 'Invalid status' })
      return
    }
    save.mutate(data)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #232526 0%, #414345 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{
        width: 480,
        padding: '36px 32px',
        borderRadius: 20,
        boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
        background: '#222',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        border: '1px solid #444'
      }}>
        <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 0, letterSpacing: 4, fontWeight: 900, fontSize: 38, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #111' }}>Tick Board</h1>
  <h2 style={{ textAlign: 'center', color: '#bbb', marginBottom: 8, letterSpacing: 2, fontWeight: 700, fontSize: 24, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>Modify Task</h2>
        <label style={{ fontWeight: 600, marginBottom: 4, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Title</label>
        <input 
          placeholder="Input title" 
          {...register('title', { required: 'Title is required' })}
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
        {errors.title && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{errors.title.message}</p>}
        <label style={{ fontWeight: 600, marginBottom: 4, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Memo</label>
        <textarea
          placeholder="Input memo"
          {...register('memo')}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            fontSize: 16,
            background: '#333',
            color: '#fff',
            fontWeight: 500,
            fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif',
            minHeight: 80,
            marginBottom: 2
          }}
        />
        <label style={{ fontWeight: 600, marginBottom: 4, color: '#bbb', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>Status</label>
        <select 
          {...register('status', { required: 'Status is required' })}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            fontSize: 16,
            background: '#333',
            color: '#fff',
            fontWeight: 500,
            fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif'
          }}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {errors.status && <p style={{ color: '#ff3b3b', fontSize: 14, margin: 0 }}>{errors.status.message}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <button 
            type="submit"
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #444 0%, #232526 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              letterSpacing: 1,
              fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif',
              transition: 'background 0.2s'
            }}
          >Save</button>
          <button 
            type="button"
            onClick={()=>del.mutate()}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #ff3b3b 0%, #232526 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              letterSpacing: 1,
              fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif',
              transition: 'background 0.2s'
            }}
          >Delete</button>
        </div>
      </form>
    </div>
  )
}