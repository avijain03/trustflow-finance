// Purpose: Agent API service — sendMessage and uploadDocument
import axiosInstance from './axiosInstance';

/**
 * sendMessage — Post a chat message to MasterAgent.
 * @param {string} message
 * @param {string} sessionId — UUID
 * @returns {Promise<{ reply, agentUsed, uiComponent, uiProps, intent }>}
 */
export async function sendMessage(message, sessionId) {
  const { data } = await axiosInstance.post('/api/v1/agent/master', { message, sessionId });
  return data.data;
}

/**
 * uploadDocument — Upload a file to DocumentVerificationAgent.
 * @param {File} file
 * @param {string} docType — e.g. 'SALARY_SLIP', 'PAN', 'AADHAAR'
 * @returns {Promise<{ status, errorCode?, sanitizedFilename }>}
 */
export async function uploadDocument(file, docType) {
  const form = new FormData();
  form.append('document', file);
  form.append('docType', docType);

  const { data } = await axiosInstance.post('/api/v1/agent/document-upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
