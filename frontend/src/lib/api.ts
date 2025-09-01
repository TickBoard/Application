import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.REACT_APP_GIN_API_BASE || '/',
  withCredentials: true,
})