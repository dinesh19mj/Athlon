const fs = require('fs');
const path = require('path');

const routes = ['tournaments', 'registrations', 'results', 'students', 'coaches', 'attendance', 'fees', 'districts', 'academies', 'approvals', 'members', 'matches', 'finances', 'settings'];

const basePath = path.join(process.cwd(), 'src', 'app', 'org', '[orgId]');

routes.forEach(route => {
  const dir = path.join(basePath, route);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const content = `export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground capitalize">${route}</h1>
      <p className="text-foreground/50 mt-2">This module is currently under construction for ATHLON OS.</p>
    </div>
  );
}`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});

console.log('Done!');
