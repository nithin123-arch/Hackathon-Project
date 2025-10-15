import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0f67fb2`;

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend Health Check:', data);
      return data;
    } else {
      console.error('❌ Backend Health Check Failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Backend Health Check Error:', error);
    return null;
  }
};

export const testBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend Test:', data);
      return data;
    } else {
      console.error('❌ Backend Test Failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Backend Test Error:', error);
    return null;
  }
};
