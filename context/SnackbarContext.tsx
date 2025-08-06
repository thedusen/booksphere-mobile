import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SnackbarType, SnackbarAction } from '@/components/common/Snackbar';

export interface SnackbarMessage {
  id: string;
  type: SnackbarType;
  message: string;
  duration?: number;
  action?: SnackbarAction;
  visible: boolean;
}

interface SnackbarState {
  messages: SnackbarMessage[];
}

type SnackbarAction_Context = 
  | { type: 'ADD_MESSAGE'; payload: Omit<SnackbarMessage, 'id' | 'visible'> }
  | { type: 'DISMISS_MESSAGE'; payload: { id: string } }
  | { type: 'CLEAR_ALL' };

interface SnackbarContextType {
  messages: SnackbarMessage[];
  showSnackbar: (
    type: SnackbarType,
    message: string,
    options?: {
      duration?: number;
      action?: SnackbarAction;
    }
  ) => string;
  dismissSnackbar: (id: string) => void;
  clearAll: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

const snackbarReducer = (state: SnackbarState, action: SnackbarAction_Context): SnackbarState => {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newMessage: SnackbarMessage = {
        ...action.payload,
        id,
        visible: true,
      };
      
      // Add to the end of the queue
      return {
        ...state,
        messages: [...state.messages, newMessage],
      };
    }
    
    case 'DISMISS_MESSAGE': {
      return {
        ...state,
        messages: state.messages.filter(message => message.id !== action.payload.id),
      };
    }
    
    case 'CLEAR_ALL': {
      return {
        ...state,
        messages: [],
      };
    }
    
    default:
      return state;
  }
};

interface SnackbarProviderProps {
  children: ReactNode;
  maxMessages?: number;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ 
  children, 
  maxMessages = 3 
}) => {
  const [state, dispatch] = useReducer(snackbarReducer, { messages: [] });

  const showSnackbar = (
    type: SnackbarType,
    message: string,
    options?: {
      duration?: number;
      action?: SnackbarAction;
    }
  ): string => {
    // Default durations based on type and complexity
    const getDefaultDuration = (type: SnackbarType, hasAction: boolean): number => {
      if (hasAction) {
        return type === 'error' ? 8000 : 6000; // More time for actionable messages
      }
      return type === 'error' ? 6000 : 4000; // Standard timing for info messages
    };

    const duration = options?.duration ?? getDefaultDuration(type, !!options?.action);

    // If we're at max capacity, remove the oldest message
    if (state.messages.length >= maxMessages) {
      const oldestMessage = state.messages[0];
      if (oldestMessage) {
        dispatch({ type: 'DISMISS_MESSAGE', payload: { id: oldestMessage.id } });
      }
    }

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        type,
        message,
        duration,
        action: options?.action,
      },
    });

    // Return the ID for potential manual dismissal
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const dismissSnackbar = (id: string) => {
    dispatch({ type: 'DISMISS_MESSAGE', payload: { id } });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const contextValue: SnackbarContextType = {
    messages: state.messages,
    showSnackbar,
    dismissSnackbar,
    clearAll,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};