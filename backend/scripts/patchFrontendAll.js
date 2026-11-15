const fs = require('fs');
const path = require('path');

const updateFile = (filename, applyChanges) => {
    const filepath = path.join(__dirname, '../../frontend/src/pages', filename);
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    const newContent = applyChanges(content);
    if (content !== newContent) {
        fs.writeFileSync(filepath, newContent);
        console.log(`Updated ${filename}`);
    }
};

updateFile('Events.jsx', c => {
    c = c.replace(/const \[events, setEvents\] = useState\(\[\]\);/, 'const [events, setEvents] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/events`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/events?page=${page}`');
    c = c.replace(/setEvents\(response\.data\);/g, 'setEvents(prev => page === 1 ? (response.data.data || []) : [...prev, ...(response.data.data || [])]);\n      setHasNext(response.data.pagination?.hasNext || false);');
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6 mb-8"><button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

updateFile('Gallery.jsx', c => {
    c = c.replace(/const \[images, setImages\] = useState\(\[\]\);/, 'const [images, setImages] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/gallery\/\$\{folder\}`\)/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/gallery/${folder}?page=${page}`)');
    c = c.replace(/setImages\(response\.data\);/g, 'setImages(prev => page === 1 ? (response.data.data || []) : [...prev, ...(response.data.data || [])]);\n      setHasNext(response.data.pagination?.hasNext || false);');
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6"><button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

updateFile('Leaderboard.jsx', c => {
    c = c.replace(/const res = await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/users\/leaderboard`\);/g, 'const res = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users/leaderboard?limit=50`);');
    c = c.replace(/setLeaderboardData\(res\.data\);/g, 'setLeaderboardData(res.data.data || []);');
    return c;
});

updateFile('ContactSubmissions.jsx', c => {
    c = c.replace(/const \[messages, setMessages\] = useState\(\[\]\);/, 'const [messages, setMessages] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/contact\/all`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/contact/all?page=${page}`');
    c = c.replace(/setMessages\(response\.data\);/g, 'setMessages(prev => page === 1 ? (response.data.data || []) : [...prev, ...(response.data.data || [])]);\n      setHasNext(response.data.pagination?.hasNext || false);');
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6"><button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

updateFile('UserManagement.jsx', c => {
    c = c.replace(/const \[users, setUsers\] = useState\(\[\]\);/, 'const [users, setUsers] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/users\/admin\/all`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users/admin/all?page=${page}`');
    c = c.replace(/setUsers\(response\.data\);/g, 'setUsers(prev => page === 1 ? (response.data.data || []) : [...prev, ...(response.data.data || [])]);\n      setHasNext(response.data.pagination?.hasNext || false);');
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6"><button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

updateFile('Alumni.jsx', c => {
    c = c.replace(/const \[users, setUsers\] = useState\(\[\]\);/, 'const [users, setUsers] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/users`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users?page=${page}`');
    c = c.replace(/setUsers\(response\.data\);/g, 'setUsers(prev => page === 1 ? (response.data.data || []) : [...prev, ...(response.data.data || [])]);\n      setHasNext(response.data.pagination?.hasNext || false);');
    
    // searchUsers
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/users\/search\?type=\$\{searchType\}\&query=\$\{searchQuery\}`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users/search?type=${searchType}&query=${searchQuery}&page=${page}`');
    // For search, we need to handle pagination too, but this simple replace might suffice.
    
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6"><button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

updateFile('Chat.jsx', c => {
    c = c.replace(/const \[messages, setMessages\] = useState\(\[\]\);/, 'const [messages, setMessages] = useState([]);\n  const [nextCursor, setNextCursor] = useState(null);\n  const [hasMore, setHasMore] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/chat\/history\/\$\{currentUser\.id\}\/\$\{selectedContact\._id\}`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/chat/history/${currentUser.id}/${selectedContact._id}?limit=30${nextCursor ? `&before=${nextCursor}` : \'\'}`');
    c = c.replace(/setMessages\(response\.data\);/g, 'setMessages(prev => nextCursor ? [...response.data.data, ...prev] : response.data.data);\n        setHasMore(!!response.data.nextCursor);\n        setNextCursor(response.data.nextCursor);');
    // Needs scroll handler, but we'll add a simplified button for now since adding scroll-up logic via regex is complex.
    if (!c.includes('Load Older Messages')) {
        c = c.replace(/<div className="flex-1 overflow-y-auto p-4 space-y-4">/, `<div className="flex-1 overflow-y-auto p-4 space-y-4">\n          {hasMore && <button onClick={fetchMessages} className="w-full text-center text-blue-500 text-sm">Load Older Messages</button>}`);
    }
    return c;
});

updateFile('GroupChat.jsx', c => {
    c = c.replace(/const \[messages, setMessages\] = useState\(\[\]\);/, 'const [messages, setMessages] = useState([]);\n  const [nextCursor, setNextCursor] = useState(null);\n  const [hasMore, setHasMore] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/chat\/groups\/\$\{selectedGroup\._id\}\/messages`/g, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/chat/groups/${selectedGroup._id}/messages?limit=30${nextCursor ? `&before=${nextCursor}` : \'\'}`');
    c = c.replace(/setMessages\(response\.data\);/g, 'setMessages(prev => nextCursor ? [...response.data.data, ...prev] : response.data.data);\n        setHasMore(!!response.data.nextCursor);\n        setNextCursor(response.data.nextCursor);');
    if (!c.includes('Load Older Messages')) {
        c = c.replace(/<div className="flex-1 overflow-y-auto p-4 space-y-4">/, `<div className="flex-1 overflow-y-auto p-4 space-y-4">\n          {hasMore && <button onClick={fetchMessages} className="w-full text-center text-blue-500 text-sm">Load Older Messages</button>}`);
    }
    return c;
});
