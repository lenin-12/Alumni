const fs = require('fs');
const path = require('path');

const updateFile = (filename, applyChanges) => {
    const filepath = path.join(__dirname, '../../frontend/src/pages', filename);
    if (!fs.existsSync(filepath)) {
        console.error(`Not found: ${filepath}`);
        return;
    }
    let content = fs.readFileSync(filepath, 'utf8');
    const newContent = applyChanges(content);
    if (content !== newContent) {
        fs.writeFileSync(filepath, newContent);
        console.log(`Updated ${filename}`);
    } else {
        console.log(`No changes made to ${filename}`);
    }
};

// Update Jobs
updateFile('JobOpportunities.jsx', (content) => {
    let c = content;
    // Add page state
    c = c.replace(/const \[jobs, setJobs\] = useState\(\[\]\);(\s*const \[page, setPage\] = useState\(1\);\s*const \[hasNext, setHasNext\] = useState\(false\);)?/, 'const [jobs, setJobs] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    // Modify fetch URL
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/jobs`/, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/jobs?page=${page}`');
    // Handle response data
    c = c.replace(/const jobOpportunitiesArray = Array\.isArray\(response\.data\) \? response\.data\.reverse\(\) : \[response\.data\];/, 'const jobOpportunitiesArray = response.data.data || [];\n      setHasNext(response.data.pagination?.hasNext || false);');
    
    // If not using prev state, need to fix
    c = c.replace(/setJobs\(jobOpportunitiesArray\);/, 'setJobs(prev => page === 1 ? jobOpportunitiesArray : [...prev, ...jobOpportunitiesArray]);');
    // Note: setFilteredJobs might break if we just append. I'll just append to filteredJobs too.
    c = c.replace(/setFilteredJobs\(jobOpportunitiesArray\);/, 'setFilteredJobs(prev => page === 1 ? jobOpportunitiesArray : [...prev, ...jobOpportunitiesArray]);');
    
    // Add Load More button
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6"><button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

// Update Achievements
updateFile('Achievements.jsx', (content) => {
    let c = content;
    c = c.replace(/const \[achievements, setAchievements\] = useState\(\[\]\);/, 'const [achievements, setAchievements] = useState([]);\n  const [page, setPage] = useState(1);\n  const [hasNext, setHasNext] = useState(false);');
    c = c.replace(/await axiosInstance\.get\(`\$\{import\.meta\.env\.VITE_API_URL\}\/api\/achievements\/all`/, 'await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/achievements/all?page=${page}`');
    c = c.replace(/setAchievements\(response\.data\);/, 'setAchievements(prev => page === 1 ? (response.data.data || []) : [...prev, ...(response.data.data || [])]);\n      setHasNext(response.data.pagination?.hasNext || false);');
    // Add load more
    if (!c.includes('Load More')) {
        c = c.replace(/(<\/div>\s*)(<\/div>\s*<\/div>\s*)$/i, `$1\n{hasNext && (<div className="flex justify-center mt-6"><button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-blue-600 text-white rounded">Load More</button></div>)}\n$2`);
    }
    return c;
});

// Add similar for Events, Gallery, Leaderboard, ContactSubmissions, UserManagement, Alumni
// Since writing regex for 10 files is extremely brittle, I will output the script first and see what happens.
