import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { Send, MessageCircle, Users } from 'lucide-react';

export function ChatInterface() {
  const { user } = useAuth();
  const { chatMessages, addChatMessage, employees, clients } = useAppData();
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const allUsers = [...employees, ...clients].filter(u => u.id !== user?.id);
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedRecipient || !user) return;

    const message = {
      id: Date.now().toString(),
      senderId: user.id,
      recipientId: selectedRecipient,
      content: messageText,
      timestamp: new Date(),
      type: 'text' as const,
      isRead: false
    };

    addChatMessage(message);
    setMessageText('');
  };

  const getConversationMessages = (recipientId: string) => {
    return chatMessages
      .filter(msg => 
        (msg.senderId === user?.id && msg.recipientId === recipientId) ||
        (msg.senderId === recipientId && msg.recipientId === user?.id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const selectedUser = allUsers.find(u => u.id === selectedRecipient);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Chat</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comunica con dipendenti e clienti in tempo reale
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex h-96">
          {/* Users List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Contatti
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {allUsers.map((contact) => {
                const lastMessage = getConversationMessages(contact.id).slice(-1)[0];
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedRecipient(contact.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedRecipient === contact.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-gray-700">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {contact.role === 'employee' ? 'Dipendente' : 'Cliente'}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedRecipient ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-white">
                        {selectedUser?.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{selectedUser?.name}</h4>
                      <p className="text-xs text-gray-500">
                        {selectedUser?.role === 'employee' ? 'Dipendente' : 'Cliente'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {getConversationMessages(selectedRecipient).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Scrivi un messaggio..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Seleziona una conversazione</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Scegli un contatto per iniziare a chattare
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}