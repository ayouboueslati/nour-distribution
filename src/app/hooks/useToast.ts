'use client';

import { notificationService } from '../lib/notifications';

export function useToast() {
  const showSuccess = (title: string, message: string, duration?: number) => {
    notificationService.success(title, message, duration);
  };

  const showError = (title: string, message: string, duration?: number) => {
    notificationService.error(title, message, duration);
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    notificationService.warning(title, message, duration);
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    notificationService.info(title, message, duration);
  };

  const showPermissionError = (
    title: string, 
    message: string, 
    requiredRoles?: string,
    userRole?: string
  ) => {
    notificationService.permissionError(title, message, requiredRoles, userRole);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPermissionError,
  };
}