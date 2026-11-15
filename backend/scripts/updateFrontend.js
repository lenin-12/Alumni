const fs = require('fs');
const path = require('path');

const updateFile = (filename, replacements) => {
    const filepath = path.join(__dirname, '../../frontend/src/pages', filename);
    if (!fs.existsSync(filepath)) return console.error(`Not found: ${filepath}`);
    let content = fs.readFileSync(filepath, 'utf8');
    
    for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
    }
    fs.writeFileSync(filepath, content);
    console.log(`Updated ${filename}`);
};

// Example update for JobOpportunities.jsx
updateFile('JobOpportunities.jsx', [
    {
        regex: /const \[jobs, setJobs\] = useState\(\[\]\);/,
        replace: "const [jobs, setJobs] = useState([]);\n    const [page, setPage] = useState(1);\n    const [hasNext, setHasNext] = useState(false);\n"
    },
    {
        regex: /const res = await api\.get\('\/jobs'\);/g,
        replace: "const res = await api.get(`/jobs?page=${page}`);"
    },
    {
        regex: /setJobs\(res\.data\);/g,
        replace: "setJobs(prev => page === 1 ? res.data.data : [...prev, ...res.data.data]);\n            setHasNext(res.data.pagination.hasNext);"
    }
]);

// Since this requires manual adjustments for every single file, 
// let me actually run a python or node script that broadly searches and replaces.
