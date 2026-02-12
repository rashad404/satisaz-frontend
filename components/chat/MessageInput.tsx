"use client";

import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Send, Paperclip, X, Image, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const { sendMessage, sendTypingIndicator, activeConversation } = useChat();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';

    // Send typing indicator
    if (e.target.value.length > 0) {
      sendTypingIndicator(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    }
  }, [sendTypingIndicator]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5)); // Max 5 files
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(async () => {
    if ((!content.trim() && files.length === 0) || isSendingRef.current || !activeConversation) return;

    isSendingRef.current = true;
    setIsSending(true);
    sendTypingIndicator(false);

    try {
      await sendMessage(content.trim(), files.length > 0 ? files : undefined);
      setContent('');
      setFiles([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [content, files, activeConversation, sendMessage, sendTypingIndicator]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  if (!activeConversation) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4 safe-area-inset-bottom">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, index) => {
            const preview = getFilePreview(file);
            return (
              <div
                key={index}
                className="relative group flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 pr-8"
              >
                {preview ? (
                  <img src={preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                    {getFileIcon(file)}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                  <span className="text-xs text-gray-500">{Math.round(file.size / 1024)}KB</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/50 active:bg-red-200 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-xl transition-colors flex-shrink-0"
          title="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              'w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl resize-none',
              'text-base text-gray-900 dark:text-white placeholder-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-purple-500',
              'max-h-[150px] overflow-y-auto'
            )}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!content.trim() && files.length === 0) || isSending}
          className={cn(
            'p-3 rounded-xl transition-colors flex-shrink-0',
            content.trim() || files.length > 0
              ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSending ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Helper text - only on desktop */}
      <p className="hidden sm:block text-xs text-gray-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}

export default MessageInput;
