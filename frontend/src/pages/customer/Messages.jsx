import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as messageService from '../../services/messageService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState('');
  const [newReceiverId, setNewReceiverId] = useState('');

  const loadConversations = async () => {
    const list = await messageService.getConversations();
    setConversations(list || []);
  };

  useEffect(() => {
    let active = true;
    loadConversations()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load messages');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openThread = async (userId) => {
    setActiveUserId(userId);
    setThreadLoading(true);
    setError('');
    try {
      const thread = await messageService.getThread(userId);
      setMessages(thread.messages || []);
      setPartner(thread.partner);
    } catch (err) {
      setError(err.message || 'Unable to open conversation');
    } finally {
      setThreadLoading(false);
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!activeUserId || !draft.trim()) return;
    setError('');
    try {
      await messageService.sendMessage({
        receiverId: activeUserId,
        message: draft.trim(),
      });
      setDraft('');
      await openThread(activeUserId);
      await loadConversations();
    } catch (err) {
      setError(err.message || 'Could not send message');
    }
  };

  const startNew = async (e) => {
    e.preventDefault();
    if (!newReceiverId.trim()) return;
    await openThread(newReceiverId.trim());
    setNewReceiverId('');
  };

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h1>Messages</h1>
          <p>Chat with sellers and buyers on NileLink.</p>
        </header>

        {error ? <div className="alert alert--error">{error}</div> : null}

        <form
          onSubmit={startNew}
          className="page__toolbar"
          style={{ marginBottom: '1rem' }}
        >
          <label className="field" style={{ flex: 1 }}>
            Start chat by user ID
            <input
              value={newReceiverId}
              onChange={(e) => setNewReceiverId(e.target.value)}
              placeholder="Paste recipient user UUID"
            />
          </label>
          <button type="submit" className="btn btn--secondary btn--sm">
            Open
          </button>
        </form>

        {loading ? (
          <LoadingSpinner label="Loading conversations…" />
        ) : (
          <div className="messages-layout">
            <aside className="messages-list">
              {conversations.length === 0 ? (
                <p style={{ padding: '1rem', color: '#4d6358' }}>No conversations yet.</p>
              ) : (
                conversations.map((conv) => {
                  const other =
                    conv.sender_id === user?.id
                      ? conv.receiver || { id: conv.receiver_id, name: 'User' }
                      : conv.sender || { id: conv.sender_id, name: 'User' };
                  const otherId = other?.id;
                  if (!otherId) return null;
                  return (
                    <button
                      key={otherId}
                      type="button"
                      className={activeUserId === otherId ? 'is-active' : ''}
                      onClick={() => openThread(otherId)}
                    >
                      <strong>{other?.name || 'User'}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#4d6358' }}>
                        {conv.lastMessage || conv.message || 'Open thread'}
                      </div>
                    </button>
                  );
                })
              )}
            </aside>

            <section className="messages-thread">
              {!activeUserId ? (
                <div className="empty-state" style={{ margin: 'auto', border: 'none' }}>
                  <h2>Select a conversation</h2>
                  <p>Choose a contact or start a new chat.</p>
                </div>
              ) : threadLoading ? (
                <div style={{ padding: '1.25rem' }}>
                  <LoadingSpinner label="Loading thread…" />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: '0.9rem 1rem',
                      borderBottom: '1px solid #e2ebe5',
                      fontWeight: 600,
                      color: 'var(--color-forest)',
                    }}
                  >
                    {partner?.name || 'Conversation'}
                  </div>
                  <div className="messages-thread__body">
                    {messages.map((msg) => {
                      const mine = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`bubble ${mine ? 'bubble--mine' : 'bubble--theirs'}`}
                        >
                          {msg.message}
                        </div>
                      );
                    })}
                  </div>
                  <form className="messages-thread__compose" onSubmit={onSend}>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message…"
                    />
                    <button type="submit" className="btn btn--primary btn--sm">
                      Send
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Messages;
