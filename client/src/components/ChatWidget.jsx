import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatWidget.css';
import ShinyText from './ShinyText';
import { FaComments, FaQuestionCircle, FaTimes } from 'react-icons/fa';

const socket = io();

const ChatWidget = () => {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('chatMessages');
    return stored
      ? JSON.parse(stored)
      : [
          {
            text: 'Hi! Welcome to The Drunken Giraffe 🦒🍷. You can ask for pages like "about", "store", or "cart"!',
            sender: 'bot',
          },
        ];
  });
  const [botTyping, setBotTyping] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, { text: msg, sender: 'other' }]);
    });

    return () => socket.off('receiveMessage');
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    function handleScroll() {
      const footer = document.getElementById('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If the footer is visible in the viewport
      if (footerRect.top < windowHeight) {
        // Move the widget up so it sits above the footer
        const overlap = windowHeight - footerRect.top;
        setBottomOffset(overlap + 20);
      } else {
        // Footer not visible, stick to default
        setBottomOffset(20);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleNavigation = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('about')) {
      navigate('/about');
      return 'Taking you to the About page!';
    } else if (lower.includes('store') || lower.includes('product')) {
      navigate('/store');
      return 'Taking you to the Store!';
    } else if (lower.includes('cart')) {
      navigate('/cart');
      return 'Taking you to your Cart!';
    } else if (lower.includes('home') || lower.includes('landing')) {
      navigate('/landing-page');
      return 'Heading to the Home page!';
    } else if (lower.includes('help')) {
      return 'Try: "about us", "store", "cart", or "home".';
    } else if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello there! 👋 What can I help you with today?';
    }
    return null;
  };

  const sendMessage = () => {
    if (message.trim()) {
      const userMsg = { text: message, sender: 'user' };
      setMessages((prev) => [...prev, userMsg]);
      socket.emit('sendMessage', message);
      setMessage('');

      const navResponse = handleNavigation(message);
      setBotTyping(true);

      setTimeout(() => {
        const botMsg = navResponse
          ? { text: navResponse, sender: 'bot' }
          : { text: 'I\'m here to help! Try asking for "about us", "store", or "cart".', sender: 'bot' };

        setMessages((prev) => [...prev, botMsg]);
        setBotTyping(false);
      }, 1200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="chat-widget"
      style={{
        position: 'fixed',
        right: 20,
        bottom: bottomOffset,
        zIndex: 2000,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="chat-toggle" onClick={() => setShowChat(!showChat)}>
          <FaComments style={{ marginRight: 6 }} />
          <ShinyText
            text={showChat ? 'Close Chat' : 'Chat'}
            disabled={false}
            speed={3}
            className="chat-shiny-text"
          />
        </button>
        <button
          className="contact-toggle"
          title="Contact Us"
          onClick={() => setShowContact(true)}
          style={{
            background: '#fff',
            border: '1px solid #e1bb3e',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: 4
          }}
        >
          <FaQuestionCircle color="#9b1c23" size={20} />
        </button>
      </div>

      {showChat && (
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {botTyping && (
              <div className="chat-message bot typing">
                The Drunken Giraffe is typing...
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {showContact && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 90,
            background: '#fff',
            border: '2px solid #e1bb3e',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            padding: 24,
            zIndex: 3000,
            minWidth: 320,
            maxWidth: 360
          }}
        >
          <button
            onClick={() => setShowContact(false)}
            style={{
              position: 'absolute',
              top: 8,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#9b1c23',
              cursor: 'pointer'
            }}
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <h3 style={{ color: '#350b0f', marginBottom: 12 }}>Contact Us</h3>
          <div style={{ color: '#444', fontSize: 16, marginBottom: 12 }}>
            <b>For General Enquiries</b>
            <div>Contact: <a href="tel:0814107793" style={{ color: '#9b1c23' }}>081 410 7793</a></div>
            <div>Email: <a href="mailto:DrunkenG@gmail.com" style={{ color: '#9b1c23' }}>DrunkenG@gmail.com</a></div>
          </div>
          <div style={{ color: '#444', fontSize: 16, marginBottom: 12 }}>
            <b>For Online Shopping Enquiries</b>
            <div>Contact: <a href="tel:0814107793" style={{ color: '#9b1c23' }}>081 410 7793</a></div>
            <div>Email: <a href="mailto:DrunkenG.support@gmail.com" style={{ color: '#9b1c23' }}>DrunkenG.support@gmail.com</a></div>
          </div>
          <div style={{ color: '#444', fontSize: 16, marginBottom: 8 }}>
            <b>Contact Centre Hours:</b>
            <div>Monday to Saturday: 8am – 5pm</div>
            <div>Sunday & Public Holidays: 9am – 4pm</div>
            <div style={{ marginTop: 6, fontSize: 15, color: '#b71c1c' }}>
              Closed on Good Friday, Christmas Day, Day of Goodwill & New Year's Day.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
