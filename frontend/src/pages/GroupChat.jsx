import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useUser } from "../UserContext";
import { Link } from "react-router-dom";
import { Send, Plus, Users, MessageSquare, ArrowLeft, LogOut, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
    const [groupName, setGroupName] = useState("");

    const handleCreate = () => {
        if (!groupName.trim()) return;
        onCreate(groupName);
        setGroupName(""); 
        onClose(); 
    };

    if (!isOpen) return null; 

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Create New Group</h2>
                <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex justify-end mt-4 space-x-2">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

const GroupChat = () => {
    const { user } = useUser();
    const userId = user?.id;
    const [userNames, setUserNames] = useState({});
    const [socket, setSocket] = useState(null);
    const [groupMessages, setGroupMessages] = useState([]);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [groups, setGroups] = useState({ joined: [], notJoined: [] });
    const [filteredGroups, setFilteredGroups] = useState(groups.notJoined);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [joinStatus, setJoinStatus] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedContent, setEditedContent] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [groupId, setGroupId] = useState("");
    const menuRefs = useRef([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredGroups(groups.notJoined);
        } else {
            setFilteredGroups(groups.notJoined.filter(group =>
                group.name.toLowerCase().includes(query.toLowerCase())
            ));
        }
    };

    const handleCloseSearch = () => {
        setIsSearching(false);
        setSearchQuery("");
        setFilteredGroups(groups.notJoined);
    };

    const exitGroup = (groupId) => {
        toast.info(
            <div>
                <p>Are you sure you want to exit this group?</p>
                <div className="mt-2 flex justify-center space-x-3">
                    <button 
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                            toast.dismiss();
                            performExitGroup(groupId);
                        }}
                    >
                        Yes, Exit
                    </button>
                    <button 
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            }
        );
    };

    const performExitGroup = (groupId) => {
        axios.post(`${import.meta.env.VITE_API_URL}/api/chat/groups/exit`, {groupId, userId}, { withCredentials: true })
            .then(() => {
                toast.success("You have successfully exited the group");
                setGroupMembers((prev) => prev.filter((member) => member !== userId));

                setGroups(prev => {
                    const joinedGroup = prev.joined.find(group => group.id === groupId);
                    if (!joinedGroup) return prev;

                    return {
                        notJoined: [...prev.notJoined, joinedGroup],
                        joined: prev.joined.filter(group => group.id !== groupId)
                    };
                });
                setFilteredGroups(groups.notJoined);
            })
            .catch(error => {
                toast.error("Failed to exit group. Please try again.");
            });
    };

    useEffect(()=>{
        setFilteredGroups(groups.notJoined);
    },[groups]);

    const updateMessage = (id, newContent) => {
        if (socket) {
            socket.emit("groupMessageUpdate", { id, content: newContent });
        }
    };

    const deleteMessage = (id) => {
        if (socket) {
            socket.emit("groupMessageDelete", { id });
            setEditingIndex(null);
        }
    };

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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

    const fetchSenderName = async (senderId) => {
        if (userNames[senderId]) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${senderId}`);
            const data = await response.json();
            setUserNames((prev) => ({ ...prev, [senderId]: data.name }));
        } catch (error) {
            toast.error("Failed to fetch user information");
        }
    };

    useEffect(() => {
        groupMessages.forEach((msg) => {
            fetchSenderName(msg.senderId);
        });
    }, [groupMessages]);

    useEffect(() => {
        if (!userId) return;
    
        axios.get(`${import.meta.env.VITE_API_URL}/api/chat/groups`, { withCredentials: true })
            .then(response => {
                const allGroups = response.data;
                const joinedGroups = [];
                const notJoinedGroups = [];
    
                allGroups.forEach(group => {
                    const isMember = group.members.some(member => {
                        const mId = (member && typeof member === 'object') ? (member.id || member._id) : member;
                        return mId && mId.toString() === userId.toString();
                    });
                    if (isMember) {
                        joinedGroups.push(group);
                    } else {
                        notJoinedGroups.push(group);
                    }
                });
    
                notJoinedGroups.sort((a, b) => a.name.localeCompare(b.name));
                setFilteredGroups(notJoinedGroups);
                setGroups({ joined: joinedGroups, notJoined: notJoinedGroups });
            })
            .catch(error => console.error("Error fetching groups:", error));
    }, [userId]);

    // Socket.io Connection Management for GroupChat
    useEffect(() => {
        if (!userId) return;

        const newSocket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true
        });

        newSocket.on("connect", () => {
            console.log("Connected to Socket.io server in GroupChat!");
            if (groupId) {
                newSocket.emit("join_group", groupId);
            }
        });

        newSocket.on("groupMessageReceived", (parsedMessage) => {
            setGroupMessages((prev) => {
                const messageId = parsedMessage.id || parsedMessage._id;
                if (prev.some(msg => (msg.id || msg._id) === messageId)) {
                    return prev;
                }
                return [...prev, parsedMessage];
            });
        });

        newSocket.on("groupMessageUpdated", (updatedMessage) => {
            setGroupMessages((prev) =>
                prev.map((msg) =>
                    (msg.id || msg._id) === (updatedMessage.id || updatedMessage._id) ? updatedMessage : msg
                )
            );
        });

        newSocket.on("groupMessageDeleted", (deletedId) => {
            setGroupMessages((prev) => prev.filter((msg) => (msg.id || msg._id) !== deletedId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    useEffect(() => {
        if (socket && groupId) {
            socket.emit("join_group", groupId);
        }
    }, [groupId, socket]);

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setJoinStatus(null);
        setGroupId(group.id);
    };

    useEffect(() => {
        if (selectedGroup == null) return;

        axios.get(`${import.meta.env.VITE_API_URL}/api/searchchat/groups/${selectedGroup.id}/members`, { withCredentials: true })
            .then(response => {
                setGroupMembers(response.data.map(member => (member.id || member._id || member).toString()));

                const isCurrentUserMember = response.data.some(member => {
                    const mId = (member && typeof member === 'object') ? (member.id || member._id) : member;
                    return mId && mId.toString() === userId.toString();
                });

                if (isCurrentUserMember) {
                    axios.get(`${import.meta.env.VITE_API_URL}/api/chat/groups/${selectedGroup.id}/messages`, { withCredentials: true })
                        .then(res => setGroupMessages(res.data))
                        .catch(error => console.error("Error fetching group messages:", error));
                }
            })
            .catch(error => console.error("Error fetching group members:", error));
    }, [selectedGroup, userId]);

    const joinGroup = (groupId) => {
        axios.post(`${import.meta.env.VITE_API_URL}/api/chat/groups/${groupId}/join`, { userId }, { withCredentials: true })
            .then(() => {
                toast.success("You have successfully joined the group!");
                setJoinStatus("You have successfully joined the group!");
                setGroupMembers((prev) => [...prev, userId]);
                setGroups(prev => {
                    const joinedGroup = prev.notJoined.find(group => group.id === groupId);
                    if (!joinedGroup) return prev;

                    return {
                        joined: [...prev.joined, joinedGroup],
                        notJoined: prev.notJoined.filter(group => group.id !== groupId)
                    };
                });
                setFilteredGroups(groups.notJoined);
            })
            .catch(() => {
                toast.error("Failed to join the group. Please try again.");
                setJoinStatus("Failed to join group!");
            });
    };

    const createGroup = (groupName) => {
        if (!groupName.trim()) {
            toast.warning("Please enter a valid group name");
            return;
        }
        
        axios.post(`${import.meta.env.VITE_API_URL}/api/chat/groups`, { name: groupName, createdBy: userId }, { withCredentials: true })
            .then(response => {
                const newGroup = response.data;
                setGroups(prev => ({
                    joined: [...prev.joined, newGroup],
                    notJoined: prev.notJoined
                }));
                toast.success(`Group "${groupName}" created successfully!`);
                handleGroupSelect(newGroup);
            })
            .catch(error => {
                toast.error("Failed to create group. Please try again.");
            });
    };

    const sendGroupMessage = () => {
        if (!input.trim()) return;
        
        if (!socket) {
            toast.error("Not connected to chat service. Please try again.");
            return;
        }

        const msg = { senderId: userId, groupId, content: input };
        socket.emit("sendGroupMessage", msg);
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendGroupMessage();
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [groupMessages]);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6F0] py-8 px-4 flex justify-center items-center">
            <div className="w-full max-w-6xl bg-white border border-[#E7DDD6] rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row h-[700px] animate-fade-in relative">
                {/* Sidebar */}
                <div className="w-full md:w-80 bg-white border-r border-[#E7DDD6] flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-4 border-b border-[#E7DDD6]">
                        <div className="flex items-center justify-between mb-4">
                            <Link to="/chat" className="flex items-center text-[#8B1E1E] hover:text-[#6F1111] transition-colors font-semibold text-sm">
                                <ArrowLeft className="w-4 h-4 mr-1 text-[#8B1E1E]" />
                                <span>Back to Chat</span>
                            </Link>
                        </div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Groups</h2>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-2 bg-[#8B1E1E] hover:bg-[#6F1111] text-white rounded-full transition-all shadow-sm hover:scale-105"
                                aria-label="Create a new group"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Component */}
                    <CreateGroupModal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        onCreate={createGroup} 
                    />

                    {/* Groups Sidebar Lists */}
                    <div className="flex-1 overflow-y-auto bg-[#FAF8F6]/50 p-3 space-y-4">
                        {/* Your Groups Section */}
                        {groups.joined.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 px-2 pb-1">
                                    <Users className="w-4 h-4 text-[#8B1E1E]" />
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Groups</h3>
                                </div>
                                <div className="space-y-1.5">
                                    {groups.joined.map((group, index) => (
                                        <div
                                            key={group.id}
                                            className={`p-3 rounded-xl cursor-pointer transition-all border duration-200 
                                                ${selectedGroup?.id === group.id
                                                    ? "bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-sm font-semibold"
                                                    : "bg-white border-[#E7DDD6]/60 text-gray-700 hover:bg-[#FAF6F0]"
                                                }`}
                                            onClick={() => handleGroupSelect(group)}
                                            style={{ animationDelay: `${(index + 1) * 30}ms` }}
                                        >
                                            <div className="font-semibold text-sm leading-tight">{group.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discover Groups Section */}
                        {groups.notJoined.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-[#E7DDD6]/55">
                                {/* Header Section */}
                                <div className="flex items-center justify-between px-2 pb-1">
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="w-4 h-4 text-[#A6491F]" />
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discover Groups</h3>
                                    </div>

                                    {/* Search Icon */}
                                    <Search 
                                        className="w-4 h-4 text-gray-500 cursor-pointer hover:text-[#8B1E1E] transition-all"
                                        onClick={() => setIsSearching(true)}
                                    />
                                </div>

                                {/* Search Box */}
                                {isSearching && (
                                    <div className="relative mt-2 px-1">
                                        <div className="flex items-center border border-gray-305 rounded-full px-3 py-1.5 bg-white shadow-sm">
                                            <Search className="w-4 h-4 text-gray-400 mr-2" />
                                            <input
                                                type="text"
                                                placeholder="Search groups..."
                                                value={searchQuery}
                                                autoFocus
                                                onChange={(e) => handleSearch(e.target.value)}
                                                className="text-xs outline-none w-full text-gray-800"
                                            />
                                            <X 
                                                className="w-4 h-4 text-gray-400 cursor-pointer ml-2 hover:text-[#8B1E1E]"
                                                onClick={handleCloseSearch}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Group List */}
                                <div className="space-y-1.5">
                                    {filteredGroups.map((group, index) => (
                                        <div
                                            key={group.id}
                                            className={`p-3 rounded-xl cursor-pointer transition-all border duration-200 bg-white border-[#E7DDD6]/60 text-gray-700 hover:bg-[#FAF6F0]`}
                                            onClick={() => handleGroupSelect(group)}
                                            style={{ animationDelay: `${(index + 1) * 30}ms` }}
                                        >
                                            <div className="font-semibold text-sm leading-tight text-gray-805">{group.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-grow flex flex-col h-full bg-white justify-between">
                    {selectedGroup ? (
                        <div className="flex flex-col h-full justify-between animate-fade-in">
                            {/* Chat Header */}
                            <div className="bg-[#FAF8F6] border-b border-[#E7DDD6] p-4 flex items-center justify-between sticky top-0 z-10">
                                <div>
                                    <h3 className="text-base font-bold text-[#3D0707]">{selectedGroup.name}</h3>
                                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{groupMembers.length} members</p>
                                </div>

                                {/* Join button only shows for non-joined groups */}
                                {!groupMembers.includes(userId) && (
                                    <button
                                        onClick={() => joinGroup(selectedGroup.id)}
                                        className="px-4 py-2 bg-[#8B1E1E] hover:bg-[#6F1111] text-white text-xs font-bold rounded-full shadow-sm transition-all hover:-translate-y-0.5"
                                    >
                                        Join Group
                                    </button>
                                )}

                                {groupMembers.includes(userId) && (
                                    <button
                                        onClick={() => exitGroup(selectedGroup.id)}
                                        className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-650 transition shadow-sm"
                                        title="Exit Group"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Status message if any */}
                            {joinStatus && (
                                <div className={`text-center p-2 text-xs font-semibold ${joinStatus.includes("success") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                    }`}>
                                    {joinStatus}
                                </div>
                            )}

                            {/* Messages area */}
                            <div className="flex-grow overflow-y-auto p-4 bg-white" ref={chatContainerRef}>
                                {groupMembers.includes(userId) ? (
                                    groupMessages.length > 0 ? (
                                        <div className="space-y-4">
                                            {groupMessages.map((msg, index) => (
                                                <div key={index} className={`flex items-center ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                                                    <div className={`relative chat-bubble flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === userId ? "bg-[#8B1E1E] text-white shadow-sm" : "bg-[#FAF6F0] text-gray-800 border border-[#E7DDD6]"}`}>

                                                        {/* Edit mode */}
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

                                                        {/* Sender's Name */}
                                                        <span className={`text-[10px] ml-1.5 uppercase font-bold ${msg.senderId === userId ? "text-red-200" : "text-gray-400"}`}>
                                                            {msg.senderId === userId ? "You" : userNames[msg.senderId] || "User"}
                                                        </span>

                                                        {/* Edit & Delete Options (Only for User's Messages) */}
                                                        {msg.senderId === userId && (
                                                            <div className="relative" ref={(el) => (menuRefs.current[index] = el)}>
                                                                <button className="ml-2 text-red-100 hover:text-white focus:outline-none" onClick={() => handleEdit(index, msg.content)}>⋮</button>

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
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-400 text-sm text-center max-w-md">
                                                No messages yet. Be the first to start the conversation!
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center max-w-md p-8 bg-white rounded-xl border border-[#E7DDD6] shadow-sm">
                                            <h4 className="text-base font-bold text-[#3D0707] mb-2">Join this group</h4>
                                            <p className="text-gray-550 text-sm mb-4">You need to join this group to see messages and participate in the conversation.</p>
                                            <button
                                                onClick={() => joinGroup(selectedGroup.id)}
                                                className="px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#6F1111] text-white font-bold rounded-full shadow-sm transition-all hover:-translate-y-0.5 w-full text-sm uppercase tracking-wider"
                                            >
                                                Join Group
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area - Only show for joined groups */}
                            {groupMembers.includes(userId) && (
                                <div className="p-4 bg-white border-t border-[#E7DDD6] flex items-center space-x-2">
                                    <input
                                        className="flex-1 p-3 px-4 bg-gray-50 border border-gray-305 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition-all text-sm"
                                        placeholder="Type a message..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                    />
                                    <button
                                        className={`p-3 rounded-full transition-all shadow-sm flex items-center justify-center hover:-translate-y-0.5 ${input.trim()
                                            ? "bg-[#8B1E1E] text-white hover:bg-[#6F1111]"
                                            : "bg-gray-250 text-gray-400 cursor-not-allowed shadow-none hover:translate-y-0"
                                            }`}
                                        onClick={sendGroupMessage}
                                        disabled={!input.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center p-4 animate-fade-in">
                            <div className="max-w-md">
                                <div className="w-16 h-16 bg-[#FAF6F0] border border-[#E7DDD6] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-[#8B1E1E]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#3D0707] mb-2">Group Conversations</h3>
                                <p className="text-gray-550 text-sm mb-6">Select a group from the sidebar to start chatting or create a new group.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#6F1111] text-white font-bold rounded-full shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center mx-auto text-sm uppercase tracking-wider"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create a Group
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupChat;


