import React from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ============================================================================
// Job Management
// ============================================================================

export const createJob = async (description: string, photoKeys: string[]) => {
    const response = await axios.post(`${API_URL}/jobs/create`, {
        description,
        photo_keys: photoKeys
    });
    return response.data;
};

export const getJob = async (jobId: number) => {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
};

export const cancelJob = async (jobId: number, reason: string, userId: string) => {
    const response = await axios.post(`${API_URL}/jobs/${jobId}/cancel`, {
        reason,
        userId
    });
    return response.data;
};

// ============================================================================
// Quote/Levantamiento Management
// ============================================================================

export const createQuote = async (quoteData: {
    jobId: number;
    contractorId: string;
    contractorName: string;
    contractorEmail: string;
    description: string;
    estimatedCost: number;
    materialsCost: number;
    laborCost: number;
    otherCosts: number;
    timelineDays: number;
    timelineDescription: string;
    guarantees: string;
    paymentTerms: string;
    photoKeys: string[];
}) => {
    const response = await axios.post(`${API_URL}/quotes/create`, quoteData);
    return response.data;
};

export const getQuote = async (quoteId: number) => {
    const response = await axios.get(`${API_URL}/quotes/${quoteId}`);
    return response.data;
};

export const getQuotesByJob = async (jobId: number) => {
    const response = await axios.get(`${API_URL}/quotes/job/${jobId}`);
    return response.data;
};

export const getQuotesByContractor = async (contractorId: string) => {
    const response = await axios.get(`${API_URL}/quotes/contractor/${contractorId}`);
    return response.data;
};

export const cancelQuote = async (quoteId: number, reason: string, contractorId: string) => {
    const response = await axios.post(`${API_URL}/quotes/${quoteId}/cancel`, {
        reason,
        contractorId
    });
    return response.data;
};

// ============================================================================
// Notifications
// ============================================================================

export const getNotifications = async (userId: string) => {
    const response = await axios.get(`${API_URL}/notifications/${userId}`);
    return response.data;
};

export const getUnreadNotificationsCount = async (userId: string) => {
    const response = await axios.get(`${API_URL}/notifications/${userId}/unread-count`);
    return response.data;
};

export const markNotificationAsRead = async (notificationId: number) => {
    const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async (userId: string) => {
    const response = await axios.put(`${API_URL}/notifications/${userId}/read-all`);
    return response.data;
};
