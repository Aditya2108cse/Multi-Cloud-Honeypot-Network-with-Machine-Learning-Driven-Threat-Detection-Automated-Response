import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  X,
  Sparkles,
  AlertTriangle,
  FileText,
  Calendar,
  Bot,
  Loader2,
} from 'lucide-react'

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi Admin! 👋\n\nI'm here to help you monitor and secure your infrastructure. What would you like to know?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)
  const floatAnimation = useRef(0)

  // Floating animation
  useEffect(() => {
    const animate = () => {
      floatAnimation.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(floatAnimation.current)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = [
    { label: 'Show me critical threats', icon: AlertTriangle },
    { label: 'Generate security report', icon: FileText },
    { label: "What's new today?", icon: Calendar },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ""
      
      if (userInput.toLowerCase().includes('critical') || userInput.toLowerCase().includes('threat')) {
        response = "Based on the latest correlation data, I've identified **3 critical threats** requiring immediate attention:\n\n1. **185.234.219.8** - SQL Injection & brute force (128 events)\n2. **203.0.113.45** - Port scanning & lateral movement (96 events)\n3. **192.168.1.100** - Credential stuffing attack (74 events)\n\nAll three IPs have been automatically blocked across AWS, Azure, and GCP. Would you like me to generate a detailed incident report?"
      } else if (userInput.toLowerCase().includes('report')) {
        response = "I've generated a **Security Summary Report** for the last 24 hours:\n\n---\n**Threat Activity Overview**\n• Total Alerts: 1,248 (+12.5%)\n• Correlated Threats: 86 (+8.2%)\n• IPs Blocked: 43 (+5.7%)\n• Active Regions: 12\n\n**Top Attack Vectors**\n1. SSH Brute Force (42%)\n2. Web App Attacks (28%)\n3. Port Scanning (18%)\n4. Credential Stuffing (12%)\n\n**Recommendations**\n• Review whitelist for 192.168.1.0/24\n• Consider geo-blocking for high-risk regions\n• Schedule automated correlation tuning"
      } else if (userInput.toLowerCase().includes('new') || userInput.toLowerCase().includes('today')) {
        response = "Here's what's new in the last 24 hours:\n\n🔔 **New Correlated Threats**: 8 (3 critical, 3 high, 2 medium)\n🔒 **Newly Blocked IPs**: 5 across all cloud platforms\n📊 **Alert Volume**: Increased 12.5% from yesterday\n🌍 **New Attack Regions**: 2 (APAC, LATAM)\n⚡ **Automated Responses**: 23 blocks executed\n\nThe system is operating normally. All cloud CLIs are responsive and firewall rules are synchronized."
      } else {
        response = "I understand you're asking about: \"" + userInput + "\"\n\nAs your AI Security Assistant, I can help you with:\n\n• **Threat Analysis** - Investigate specific IPs or attack patterns\n• **Report Generation** - Create executive or technical security reports\n• **System Status** - Check health of cloud integrations\n• **Configuration** - Guidance on tuning correlation thresholds\n• **Incident Response** - Walk through containment procedures\n\nWhat would you like to explore?"
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  if (minimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
        transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-primary-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-7 h-7" />
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      {(isOpen || !minimized) && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-50 w-96 lg:w-[380px] max-h-[600px]"
          ref={panelRef}
        >
          {/* Assistant Panel */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-beige-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-beige-200 bg-gradient-to-r from-primary-50 to-beige-50">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"
                >
                  <Bot className="w-5 h-5 text-primary-600" />
                </motion.div>
                <div>
                  <p className="font-semibold text-dark-900">AI Security Assistant</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-500"
                    />
                    <span className="text-primary-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1.5 rounded-lg text-dark-400 hover:bg-white hover:text-dark-700 transition-colors"
                  aria-label="Minimize"
                >
                  <motion.svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </motion.svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-dark-400 hover:bg-white hover:text-dark-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" style={{ maxHeight: '380px' }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-beige-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-4 h-4 text-dark-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.type === 'assistant'
                        ? 'bg-beige-100 rounded-bl-md text-dark-900'
                        : 'bg-primary-500 rounded-br-md text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 ${message.type === 'user' ? 'text-primary-100' : 'text-dark-500'}`}>
                      {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <motion.div
                      animate={{ scale: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-primary-500"
                    />
                  </div>
                  <div className="px-4 py-3 bg-beige-100 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-primary-400"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        className="w-2 h-2 rounded-full bg-primary-400"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-3 border-t border-beige-200">
              <p className="text-xs text-dark-400 mb-2 px-1">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    onClick={() => {
                      setInput(action.label)
                      handleSubmit(new Event('submit'))
                    }}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-beige-200">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="input-field flex-1 text-sm pr-10"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="btn-primary p-2.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AIAssistant