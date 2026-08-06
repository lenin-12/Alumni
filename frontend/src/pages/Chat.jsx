import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useUser } from "../UserContext";
import { Link } from "react-router-dom";
import { Send, Search, User, MessageSquare, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";

const Chat = () => {
    const { user } = useUser();
    const userId = user?.id;

    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [receiverId, setReceiverId] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedContent, setEditedContent] = useState("");

    const [triggerEffect, setTriggerEffect] = useState(0);

    // Fetch recent contacts on mount or when messages change
    useEffect(() => {
        if (!userId) return;
        axios.get(`${import.meta.env.VITE_API_URL}/api/chat/recent/${userId}`, { withCredentials: true })
            .then(response => setRecentUsers(response.data))
            .catch(error => console.error("Error fetching recent contacts:", error));
    }, [userId]);

    // WebSocket / Socket.io Connection Management
    useEffect(() => {
        if (!userId) return;

        // Initialize socket.io connection
        const newSocket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true
        });

        newSocket.on("connect", () => {
            console.log("Connected to Socket.io server!");
            newSocket.emit("join_user", userId);
        });

        // Listen for new messages received
        newSocket.on("messageReceived", (parsedMessage) => {
            setMessages((prev) => {
                const messageId = parsedMessage.id || parsedMessage._id;
                if (prev.some(msg => (msg.id || msg._id) === messageId)) {
                    return prev;
                }
                return [...prev, parsedMessage];
            });

            // Update recent users list
            axios.get(`${import.meta.env.VITE_API_URL}/api/chat/recent/${userId}`, { withCredentials: true })
                .then(response => setRecentUsers(response.data))
                .catch(error => console.error("Error updating recent contacts:", error));
        });

        // Listen for message sent confirmations
        newSocket.on("messageSent", (parsedMessage) => {
            setMessages((prev) => {
                const messageId = parsedMessage.id || parsedMessage._id;
                if (prev.some(msg => (msg.id || msg._id) === messageId)) {
                    return prev;
                }
                return [...prev, parsedMessage];
            });
        });

        // Listen for message updates (edits)
        newSocket.on("messageUpdated", (updatedMessage) => {
            setMessages((prev) => prev.map(msg =>
                (msg.id || msg._id) === (updatedMessage.id || updatedMessage._id) ? updatedMessage : msg
            ));
        });

        // Listen for message deletions
        newSocket.on("messageDeleted", (deletedId) => {
            setMessages((prev) => prev.filter(msg => (msg.id || msg._id) !== deletedId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    // Fetch message history when selected receiver changes
    useEffect(() => {
        if (!userId || !receiverId) return;
        axios.get(`${import.meta.env.VITE_API_URL}/api/chat/history/${userId}/${receiverId}`)
            .then(response => setMessages(response.data))
            .catch(error => console.error("Error fetching messages:", error));
        scrollToBottom();   
    }, [userId, receiverId]);

    const updateMessage = (id, newContent) => {
        if (socket) {
            socket.emit("messageUpdate", { id, content: newContent });
        }
    };

    const deleteMessage = (id) => {
        if (socket) {
            socket.emit("messageDelete", { id });
            setEditingIndex(null);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleEdit = (index, content) => {
        setEditingIndex(index);
        setEditedContent(content);
    };

    const handleSaveEdit = (id) => {
        updateMessage(id, editedContent);
        setEditingIndex(null);
    };

    const menuRefs = useRef([]);
    const handleClickOutside = (event) => {
        if (
            menuRefs.current[editingIndex] && 
            !menuRefs.current[editingIndex].contains(event.target) && 
            event.target.tagName !== "INPUT"
        ) {
            setEditingIndex(null);
        }
    };
    
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [editingIndex]);

    // Search users logic
    useEffect(() => {
        if (searchQuery.length === 0) {
            setSearchResults([]);
            return;
        }
        axios.get(`${import.meta.env.VITE_API_URL}/api/searchchat?query=${searchQuery}`)
            .then(response => {
                const filteredResults = response.data.filter(user => user.role !== "ADMIN" && user.id !== userId);
                setSearchResults(filteredResults);
            })
            .catch(error => console.error("Error fetching users:", error));
    }, [searchQuery, userId]);

    // Refresh contacts list when messages state changes
    useEffect(() => {
        if (userId) {
            axios.get(`${import.meta.env.VITE_API_URL}/api/chat/recent/${userId}`, { withCredentials: true })
                .then(response => setRecentUsers(response.data))
                .catch(error => console.error("Error refreshing recent users:", error));
        }
    }, [messages, userId]);

    const handleUserSelect = (user) => {
        setReceiverId(user.id);
        setReceiverName(user.name);
        setSearchQuery("");
        setSearchResults([]);
        scrollToBottom();
    };

    const sendMessage = () => {
        if (!socket || !receiverId || !input) return;
        const msg = { senderId: userId, receiverId, content: input };
        socket.emit("sendMessage", msg);
        setInput("");
        scrollToBottom();
    };

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6F0] py-8 px-4 flex justify-center items-center">
            <div className="w-full max-w-6xl bg-white border border-[#E7DDD6] rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row h-[700px] animate-fade-in relative">
                {/* Sidebar */}
                <div className="w-full md:w-80 bg-white border-r border-[#E7DDD6] flex flex-col h-full">
                    <div className="p-4 border-b border-[#E7DDD6]">
                        <div className="flex items-center justify-between mb-4">
                            <Link to="/" className="flex items-center text-[#8B1E1E] hover:text-[#6F1111] transition-colors font-semibold text-sm">
                                <ArrowLeft className="w-4 h-4 mr-1 text-[#8B1E1E]" />
                                <span>Back Home</span>
                            </Link>
                            <Link to="/group-chat" className="flex items-center text-[#8B1E1E] hover:text-[#6F1111] transition-colors font-semibold text-sm">
                                <span>Group Chat</span>
                                <MessageSquare className="w-4 h-4 ml-1 text-[#8B1E1E]" />
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-350 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] bg-white transition-all text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Search Results */}
                    {isDropdownOpen && searchResults.length > 0 && (
                        <div ref={dropdownRef} className="absolute top-[125px] left-4 bg-white border border-[#E7DDD6] rounded-xl shadow-lg w-72 z-20 overflow-hidden animate-slide-up">
                            {searchResults.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => {handleUserSelect(user); scrollToBottom(); setIsDropdownOpen(false);}}
                                    className="p-3 hover:bg-[#FAF6F0] cursor-pointer transition-colors flex items-center gap-2 border-b border-[#E7DDD6]/50 last:border-0 text-sm font-semibold"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-150 flex items-center justify-center text-gray-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-800">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recent Chats Section */}
                    <div className="p-3 pb-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Conversations</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-[#FAF8F6]/50 p-3">
                        <div className="space-y-2 pr-1">
                            {recentUsers.map((user, index) => (
                                <div
                                    key={user.id}
                                    onClick={() => {handleUserSelect(user); scrollToBottom();}}
                                    className={`p-3 rounded-xl cursor-pointer transition-all border duration-200 ${receiverId === user.id
                                        ? "bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-sm font-semibold"
                                        : "bg-white border-[#E7DDD6]/60 text-gray-700 hover:bg-[#FAF6F0]"
                                        }`}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${receiverId === user.id ? "bg-[#6F1111]" : "bg-[#FAF6F0] border border-[#E7DDD6]"
                                            }`}>
                                            <User className={`w-5 h-5 ${receiverId === user.id ? "text-white" : "text-[#8B1E1E]"}`} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm leading-tight">{user.name}</div>
                                            <div className={`text-[11px] mt-0.5 ${receiverId === user.id ? "text-red-100" : "text-gray-400"}`}>
                                                Tap to chat
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Section */}
                <div className="flex-grow flex flex-col h-full bg-white justify-between">
                    {receiverId ? (
                        <div className="flex flex-col h-full justify-between">
                            {/* Chat Header */}
                            <div className="bg-[#FAF8F6] border-b border-[#E7DDD6] p-4 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E7DDD6] flex items-center justify-center text-[#8B1E1E] mr-3 shadow-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#3D0707]">{receiverName}</h3>
                                </div>
                            </div>

                            {/* Chat Content */}
                            <div className="flex-grow overflow-y-auto p-4 bg-white" ref={chatContainerRef}>
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        (msg.senderId === receiverId || msg.receiverId === receiverId) ? (
                                            <div key={msg.id || index} className={`flex items-center ${msg.senderId === userId ? "justify-end" : "justify-start"}`} ref={index === messages.length - 1 ? messagesEndRef : null}>
                                                <div className={`relative chat-bubble flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === userId ? "bg-[#8B1E1E] text-white shadow-sm" : "bg-[#FAF6F0] text-gray-800 border border-[#E7DDD6]"}`}>
                                                    {editingIndex === index ? (
                                                        <input
                                                            type="text"
                                                            value={editedContent}
                                                            onChange={(e) => setEditedContent(e.target.value)}
                                                            className="bg-white px-2 py-1 rounded border text-black focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                                        />
                                                    ) : (
                                                        <div className="leading-relaxed">{msg.content}</div>
                                                    )}

                                                    {msg.senderId === userId && (
                                                        <div className="relative" ref={(el) => (menuRefs.current[index] = el)}>
                                                            <button className={`ml-2 font-bold focus:outline-none ${msg.senderId === userId ? "text-red-100 hover:text-white" : "text-gray-500 hover:text-gray-700"}`} onClick={() => handleEdit(index, msg.content)}>⋮</button>
                                                            {editingIndex === index && (
                                                                <div className="absolute right-0 mt-2 bg-white border border-[#E7DDD6] shadow-lg rounded-xl p-1.5 z-30 min-w-[5rem]">
                                                                    <button onClick={() => handleSaveEdit(msg.id || msg._id)} className="block px-2.5 py-1 text-xs text-[#8B1E1E] hover:bg-[#FAF6F0] rounded-md w-full text-left font-bold transition-all">Save</button>
                                                                    <button onClick={() => deleteMessage(msg.id || msg._id)} className="block px-2.5 py-1 text-xs text-red-650 hover:bg-red-50 rounded-md w-full text-left font-bold transition-all">Delete</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-[#E7DDD6] flex items-center space-x-2">
                                <input
                                    className="flex-1 p-3 px-4 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition-all text-sm"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <button
                                    onClick={sendMessage}
                                    className={`p-3 rounded-full transition-all shadow-sm flex items-center justify-center hover:-translate-y-0.5 ${input.trim()
                                        ? "bg-[#8B1E1E] text-white hover:bg-[#6F1111]"
                                        : "bg-gray-250 text-gray-400 cursor-not-allowed shadow-none hover:translate-y-0"
                                        }`}
                                    disabled={!input.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center p-4">
                            <div className="max-w-md animate-slide-up">
                                <div className="w-16 h-16 bg-[#FAF6F0] border border-[#E7DDD6] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="h-8 w-8 text-[#8B1E1E]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#3D0707] mb-2">Start a Conversation</h3>
                                <p className="text-gray-500 text-sm">Select a user from the sidebar to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;