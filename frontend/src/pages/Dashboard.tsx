import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  // 取得登入者 userId
  const [userId, setUserId] = useState('')
  useEffect(()=>{
    (async()=>{
      try{
        const res = await api.get('/api/me')
        if(res.data?.userId) setUserId(res.data.userId)
      }catch{}
    })()
  },[])
  const dash = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: async ()=> (await api.get('/api/dashboard', { params: { userId } })).data,
    enabled: !!userId
  })
  const createTask = useMutation({
    mutationFn: async (title:string)=> (await api.post('/api/tasks', { userId, title })).data,
    onSuccess: ()=> dash.refetch()
  })
  // 登出功能
  const logout = () => {
    api.post('/api/auth/logout')
    window.location.href = '/login';
  }
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #232526 0%, #414345 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>
      <div style={{ width: 500, background: '#222', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.25)', padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid #444', position: 'relative' }}>
        <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 0, letterSpacing: 4, fontWeight: 900, fontSize: 38, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #111' }}>Tick Board</h1>
        <button onClick={logout} style={{ position: 'absolute', top: 32, right: 36, background: 'none', border: 'none', color: '#bbb', fontWeight: 700, fontSize: 16, cursor: 'pointer', textDecoration: 'underline' }}>Log out</button>
        <h2 style={{ textAlign: 'center', color: '#bbb', marginBottom: 8, letterSpacing: 2, fontWeight: 700, fontSize: 24, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>Dashboard</h2>
  {/* 自動取得 userId，不需手動輸入 */}
        {dash.data && (
          <>
            <div style={{ background: '#333', borderRadius: 14, padding: '22px 24px', marginBottom: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #222' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#fff" />
                  <circle cx="16" cy="13" r="6" fill="#222" />
                  <rect x="7" y="22" width="18" height="6" rx="3" fill="#222" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: '#bbb', fontWeight: 700, fontSize: 18, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif', textAlign: 'left' }}>User Information</h3>
                <div style={{ marginTop: 6, color: '#bbb', fontSize: 16, fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif', lineHeight: 1.7 }}>
                  <div><span style={{ fontWeight: 600, color: '#fff' }}>ID：</span>{dash.data.user.id}</div>
                  <div><span style={{ fontWeight: 600, color: '#fff' }}>Email：</span>{dash.data.user.email}</div>
                  <div><span style={{ fontWeight: 600, color: '#fff' }}>Name：</span>{dash.data.user.name}</div>
                </div>
              </div>
            </div>
            <h3 style={{ color: '#fff', margin: '12px 0 8px 0', fontWeight: 700, fontSize: 20, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>Task List</h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              maxHeight: 320,
              overflowY: 'auto',
              borderRadius: 10,
              background: '#333',
              boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#444 #222'
            }}>
              {Array.isArray(dash.data.tasks) && dash.data.tasks.length > 0 ? (
                dash.data.tasks.map((t:any)=> (
                  <li key={t.id} style={{
                    background: '#444',
                    borderRadius: 10,
                    marginBottom: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.10)'
                  }}>
                    <div>
                      <Link to={`/tasks/${t.id}`} style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: 17, letterSpacing: 1, fontFamily: 'Orbitron, Roboto Mono, Segoe UI, Arial, sans-serif' }}>{t.title}</Link>
                      <span style={{ marginLeft: 14, color: '#bbb', fontSize: 15, fontWeight: 500, fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>{t.status}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li style={{ color: '#888', fontSize: 15, textAlign: 'center', fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif' }}>No tasks</li>
              )}
            </ul>
              {/* 新增任務表單 */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('newTaskTitle') as HTMLInputElement;
                  const title = input.value.trim();
                  if (title) {
                    createTask.mutate(title);
                    input.value = '';
                  }
                }}
                style={{ display: 'flex', gap: 10, marginTop: 14 }}
              >
                <input
                  name="newTaskTitle"
                  type="text"
                  placeholder="Input title"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #444',
                    fontSize: 16,
                    background: '#333',
                    color: '#fff',
                    fontWeight: 500,
                    fontFamily: 'Roboto Mono, Orbitron, Segoe UI, Arial, sans-serif'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
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
                >Add Task</button>
              </form>
            
          </>
        )}
      </div>
    </div>
  )
}