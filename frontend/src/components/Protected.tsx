import { Outlet, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function Protected(){
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async ()=> (await api.get('/api/me')).data,
  })
  if (isLoading) return <p>Loading...</p>
  if (!data?.userId) return <Navigate to="/login" />
  return <Outlet />
}