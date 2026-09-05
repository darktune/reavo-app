import { useState, useCallback } from 'react';

export function useAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      intent: 'GENERAL_CHAT',
      message: 'Hello! I am REAVO, your AI shopping assistant. How can I help you gear up today?',
      products: [],
      actions: ['Find a Laptop', 'Build a Bundle']
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionState, setSessionState] = useState({}); // Stores extracted intent context

  const toggleAssistant = () => setIsOpen(!isOpen);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', message: text }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, state: sessionState })
      });

      const data = await response.json();
      
      // Update session state locally if AI sends state updates (stubbed)
      // setSessionState(prev => ({...prev, ...data.newState}));

      setMessages(prev => [...prev, { role: 'assistant', ...data }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        message: 'Sorry, I am having trouble connecting right now. Please try again or use WhatsApp.',
        actions: ['Chat on WhatsApp']
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionState]);

  return {
    isOpen,
    toggleAssistant,
    messages,
    sendMessage,
    isTyping
  };
}
