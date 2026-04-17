// Purpose: Auth API service — register and login endpoints
import axiosInstance from './axiosInstance';

/**
 * register — Create a new TrustFlow Finance account.
 * @param {string} name
 * @param {string} phone — 10 digits
 * @param {string} password — min 8 chars
 * @returns {Promise<{ token, user }>}
 */
export async function register(name, phone, password) {
  const { data } = await axiosInstance.post('/api/v1/auth/register', { name, phone, password });
  return data.data;
}

/**
 * login — Authenticate with phone + password.
 * @param {string} phone
 * @param {string} password
 * @returns {Promise<{ token, user }>}
 */
export async function login(phone, password) {
  const { data } = await axiosInstance.post('/api/v1/auth/login', { phone, password });
  return data.data;
}
