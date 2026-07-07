// src/services/api.ts
import axios from 'axios';

const isProduction = import.meta.env.PROD;

export const api = axios.create({
  baseURL: isProduction ? `${window.location.origin}/api` : 'http://localhost:3333/api',
});