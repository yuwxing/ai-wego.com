const fs = require('fs');
const content = fs.readFileSync('C:/Users/user/AppData/Local/Temp/opencode/ai-wego-recovery/index-BduB3DGi.js', 'utf8');

// Find all Supabase API calls and task-related queries
const supabaseRe = /fetch\([^)]+tasks\?[^)]+\)/g;
let m;
let results = [];
while ((m = supabaseRe.exec(content)) !== null) {
    results.push(m[0].substring(0, 200));
}

console.log("=== SUPABASE TASK QUERIES ===");
results.forEach(r => console.log(r + '\n'));

// Find where tasks are created with status
const taskStatusRe = /status[=:]eq[.=][a-z_]+\d*|"status":"[^"]+"/g;
let statuses = new Set();
while ((m = taskStatusRe.exec(content)) !== null) {
    statuses.add(m[0]);
}
console.log("\n=== TASK STATUSES ===");
[...statuses].sort().forEach(s => console.log(s));

// Find the task hall data fetching function
const taskFetchRe = /tasks\?[^)]+select[^)]+order[^)]+/g;
while ((m = taskFetchRe.exec(content)) !== null) {
    console.log('\n=== TASK FETCH QUERY ===');
    console.log(m[0].substring(0, 300));
}

// Look for "english" or "hign" or "middle" patterns near task code
const engRe = /[^.]{0,100}(?:english|hign|middle)[^.]{0,100}\./g;
console.log('\n=== ENGLISH DAILY REFERENCES ===');
while ((m = engRe.exec(content)) !== null) {
    console.log(m[0].substring(0, 200));
}
