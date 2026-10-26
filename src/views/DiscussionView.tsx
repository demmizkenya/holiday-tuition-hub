import React, { useState, useEffect } from 'react';
import { DiscussionTopic, UserAccount } from '../types';
import { api } from '../services/api';
import { MessageSquare, ThumbsUp, Send, Plus, Filter, Search, User, BookOpen } from 'lucide-react';

interface DiscussionViewProps {
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  currentUser,
  onOpenAuthModal
}) => {
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New topic modal / form
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newGrade, setNewGrade] = useState(currentUser?.grade || 'Grade 11');
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);

  // Active topic reply state
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const data = await api.getDiscussions();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal('login');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    setPosting(true);
    try {
      const res = await api.createDiscussionTopic({
        title: newTitle.trim(),
        subject: newSubject,
        grade: newGrade,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorGrade: currentUser.grade || 'Student',
        content: newContent.trim()
      });

      if (res.success) {
        setShowNewTopic(false);
        setNewTitle('');
        setNewContent('');
        await loadDiscussions();
      }
    } catch (err) {
      console.error('Failed to post topic:', err);
    } finally {
      setPosting(false);
    }
  };

  const handlePostReply = async (topicId: string) => {
    if (!currentUser) {
      onOpenAuthModal('login');
      return;
    }
    const text = replyContent[topicId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.replyDiscussionTopic({
        topicId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorGrade: currentUser.grade,
        content: text.trim()
      });

      if (res.success) {
        setReplyContent({ ...replyContent, [topicId]: '' });
        setReplyingId(null);
        await loadDiscussions();
      }
    } catch (err) {
      console.error('Failed to reply:', err);
    }
  };

  const handleLike = async (topicId: string) => {
    try {
      await api.likeDiscussionTopic(topicId);
      setTopics(topics.map(t => t.id === topicId ? { ...t, likes: t.likes + 1 } : t));
    } catch (err) {
      console.error('Failed to like topic:', err);
    }
  };

  const filteredTopics = topics.filter(t => {
    const matchSubject = selectedSubject === 'All' || t.subject === selectedSubject;
    const matchSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
            Peer Learning Community
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-sans mt-1">
            Group Discussion Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Collaborate, discuss challenging exam problems, ask questions, and share formulas in the subjects you understand best.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuthModal('login');
            } else {
              setShowNewTopic(true);
            }
          }}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Discussion</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discussion questions by keyword or topic..."
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Kiswahili">Kiswahili</option>
            <option value="Computer Studies">Computer Studies</option>
          </select>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showNewTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Post a Discussion Question or Concept
            </h3>
            <p className="text-xs text-slate-500">
              Share a question or explanation to get peer feedback and tutor guidance.
            </p>

            <form onSubmit={handleCreateTopic} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to differentiate trigonometric functions like sin(2x)?"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Computer Studies">Computer Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Grade 13">Grade 13</option>
                    <option value="Grade 14">Grade 14</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Explanation / Working *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write the full problem description, your current steps, or the concept you wish to discuss..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopic(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {posting ? 'Posting...' : 'Publish to Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topics List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading group discussions...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">No Discussion Topics Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Be the first learner to post a question or revision topic for {selectedSubject}!
          </p>
          <button
            onClick={() => {
              if (!currentUser) onOpenAuthModal('login');
              else setShowNewTopic(true);
            }}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl"
          >
            Start First Topic
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTopics.map(topic => (
            <div
              key={topic.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4 hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {topic.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {topic.grade}
                    </span>
                    <span className="text-xs text-slate-400">
                      Posted by <strong className="text-slate-700">{topic.authorName}</strong> • {topic.createdAt.split('T')[0]}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans mt-1">
                    {topic.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleLike(topic.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-xs font-bold shrink-0"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{topic.likes || 0}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100 font-sans">
                {topic.content}
              </p>

              {/* Replies Thread */}
              {topic.replies?.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Peer & Tutor Replies ({topic.replies.length}):
                  </div>
                  {topic.replies.map(rep => (
                    <div key={rep.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span className="text-blue-900 font-bold">{rep.authorName} {rep.authorGrade ? `(${rep.authorGrade})` : ''}</span>
                        <span>{rep.createdAt.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{rep.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="pt-2 flex items-center gap-3">
                {replyingId === topic.id ? (
                  <div className="w-full flex items-center gap-2">
                    <input
                      type="text"
                      value={replyContent[topic.id] || ''}
                      onChange={(e) => setReplyContent({ ...replyContent, [topic.id]: e.target.value })}
                      placeholder="Type your explanation or reply..."
                      className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                      onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(topic.id); }}
                    />
                    <button
                      onClick={() => handlePostReply(topic.id)}
                      className="px-4 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-800"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentUser) onOpenAuthModal('login');
                      else setReplyingId(topic.id);
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Contribute an answer / reply</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
