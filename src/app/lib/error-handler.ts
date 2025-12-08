// app/lib/error-handler.ts
import { notificationService } from './notifications';

export interface BackendError {
  detail?: string | { 
    message?: string;
    title?: string;
    permission?: string;
  };
  message?: string;
  title?: string;
}

export class ErrorHandler {
  /**
   * Handle API errors and show appropriate notifications
   */
  static handleApiError(error: any, context: string = '') {
    console.error(`💥 ${context} Error:`, error);

    // Extract error message
    let title = 'Erreur';
    let message = 'Une erreur est survenue';

    if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
      
      // Check for specific error patterns
      if (message.includes('Rôle insuffisant')) {
        return this.handlePermissionError(message);
      }
      
      if (message.includes('Permission refusée')) {
        return this.handlePermissionError(message);
      }
      
      if (message.includes('403')) {
        title = 'Accès refusé';
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
    } else if (error?.response?.data) {
      const data = error.response.data as BackendError;
      
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (data.detail?.message) {
        title = data.detail.title || title;
        message = data.detail.message;
      } else if (data.message) {
        message = data.message;
      }
    }

    // Show error notification
    notificationService.error(title, message);
  }

  /**
   * Handle permission-related errors with beautiful messages
   */
  static handlePermissionError(errorMessage: string) {
    // Parse the error message to extract roles
    const roleMatch = errorMessage.match(/Rôles requis:\s*(.+?)\.\s*Votre rôle:\s*(.+)/);
    
    if (roleMatch) {
      const requiredRoles = roleMatch[1];
      const userRole = roleMatch[2];
      
      this.showPermissionModal({
        title: 'Accès restreint',
        message: `Cette fonctionnalité nécessite un rôle plus élevé.`,
        requiredRoles,
        userRole
      });
    } else {
      // Generic permission error
      this.showPermissionModal({
        title: 'Permission refusée',
        message: errorMessage || 'Vous n\'avez pas les permissions nécessaires pour cette action.',
        requiredRoles: 'supérieur',
        userRole: 'actuel'
      });
    }
  }

  /**
   * Show beautiful permission modal
   */
  private static showPermissionModal(data: {
    title: string;
    message: string;
    requiredRoles: string;
    userRole: string;
  }) {
    // Dispatch a custom event that can be listened to by a global permission modal
    const event = new CustomEvent('show-permission-error', {
      detail: data
    });
    window.dispatchEvent(event);
  }

  /**
   * Check if error is permission-related
   */
  static isPermissionError(error: any): boolean {
    const message = error?.message || '';
    return message.includes('403') || 
           message.includes('Permission') || 
           message.includes('Rôle') ||
           message.includes('Forbidden');
  }
}

// Export singleton
export const errorHandler = new ErrorHandler();