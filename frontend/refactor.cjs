const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const fileMoves = [
  // Auth
  { old: 'pages/Login.tsx', new: 'features/auth/pages/Login.tsx' },
  { old: 'pages/VerifyEmail.tsx', new: 'features/auth/pages/VerifyEmail.tsx' },
  
  // Admin
  { old: 'pages/AdminApplications.tsx', new: 'features/admin/pages/AdminApplications.tsx' },
  { old: 'pages/AdminCities.tsx', new: 'features/admin/pages/AdminCities.tsx' },
  { old: 'pages/AdminDashboard.tsx', new: 'features/admin/pages/AdminDashboard.tsx' },
  { old: 'pages/AdminGraduates.tsx', new: 'features/admin/pages/AdminGraduates.tsx' },
  { old: 'pages/AdminMatchmaking.tsx', new: 'features/admin/pages/AdminMatchmaking.tsx' },
  { old: 'pages/AdminPrograms.tsx', new: 'features/admin/pages/AdminPrograms.tsx' },
  { old: 'pages/AdminSectors.tsx', new: 'features/admin/pages/AdminSectors.tsx' },
  { old: 'pages/AdminUsers.tsx', new: 'features/admin/pages/AdminUsers.tsx' },
  
  // Admin Components
  { old: 'components/AdminDashboard/DashboardHeader.tsx', new: 'features/admin/components/DashboardHeader.tsx' },
  { old: 'components/AdminDashboard/EmploymentByProgram.tsx', new: 'features/admin/components/EmploymentByProgram.tsx' },
  { old: 'components/AdminDashboard/EmploymentStatus.tsx', new: 'features/admin/components/EmploymentStatus.tsx' },
  { old: 'components/AdminDashboard/KpiCard.tsx', new: 'features/admin/components/KpiCard.tsx' },
  { old: 'components/AdminDashboard/KpiGrid.tsx', new: 'features/admin/components/KpiGrid.tsx' },
  { old: 'components/AdminDashboard/SalaryByProgram.tsx', new: 'features/admin/components/SalaryByProgram.tsx' },
  { old: 'components/AdminDashboard/TopIndustries.tsx', new: 'features/admin/components/TopIndustries.tsx' },
  { old: 'components/AdminDashboard/lib/utils.ts', new: 'features/admin/components/lib/utils.ts' },
  { old: 'components/AdminDashboard/Ui/button.tsx', new: 'features/admin/components/Ui/button.tsx' },
  { old: 'components/AdminDashboard/Ui/cards.tsx', new: 'features/admin/components/Ui/cards.tsx' },
  { old: 'components/AdminDashboard/Ui/chart.tsx', new: 'features/admin/components/Ui/chart.tsx' },

  // Company
  { old: 'pages/Companies.tsx', new: 'features/company/pages/Companies.tsx' },
  { old: 'pages/CompanyDashboard.tsx', new: 'features/company/pages/CompanyDashboard.tsx' },
  { old: 'pages/CompanyTalentPool.tsx', new: 'features/company/pages/CompanyTalentPool.tsx' },
  { old: 'pages/Kanban.tsx', new: 'features/company/pages/Kanban.tsx' },
  { old: 'pages/JobOffers.tsx', new: 'features/company/pages/JobOffers.tsx' },

  // Graduate
  { old: 'pages/GraduateApplications.tsx', new: 'features/graduate/pages/GraduateApplications.tsx' },
  { old: 'pages/GraduateDashboard.tsx', new: 'features/graduate/pages/GraduateDashboard.tsx' },
  { old: 'pages/GraduateEducation.tsx', new: 'features/graduate/pages/GraduateEducation.tsx' },
  { old: 'pages/GraduateExperience.tsx', new: 'features/graduate/pages/GraduateExperience.tsx' },
  { old: 'pages/GraduateProfile.tsx', new: 'features/graduate/pages/GraduateProfile.tsx' },
  { old: 'pages/GraduateSurveys.tsx', new: 'features/graduate/pages/GraduateSurveys.tsx' },
  { old: 'pages/JobBoard.tsx', new: 'features/graduate/pages/JobBoard.tsx' },
  
  // Graduate Components
  { old: 'components/ProfileCompleteness.tsx', new: 'features/graduate/components/ProfileCompleteness.tsx' },
  { old: 'components/CandidateDetailsModal.tsx', new: 'features/graduate/components/CandidateDetailsModal.tsx' }
];

function createDirs() {
  const dirs = [
    'features/auth/pages',
    'features/admin/pages',
    'features/admin/components/lib',
    'features/admin/components/Ui',
    'features/company/pages',
    'features/graduate/pages',
    'features/graduate/components'
  ];
  dirs.forEach(d => {
    fs.mkdirSync(path.join(srcDir, d), { recursive: true });
  });
}

function moveFiles() {
  fileMoves.forEach(m => {
    const oldPath = path.join(srcDir, m.old);
    const newPath = path.join(srcDir, m.new);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Moved ${m.old} to ${m.new}`);
    }
  });
}

const absoluteMap = new Map();
fileMoves.forEach(m => {
  absoluteMap.set(m.old, m.new);
});

function getRelativePath(fromPath, toPath) {
  let rel = path.posix.relative(path.dirname(fromPath), toPath);
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel;
}

function updateImports(filePath, currentPosixPath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    if (!importPath.startsWith('.')) return match; 

    let oldPosixPath = currentPosixPath;
    const originalFileMovesObj = fileMoves.find(m => m.new === currentPosixPath);
    if (originalFileMovesObj) {
      oldPosixPath = originalFileMovesObj.old;
    }

    const resolvedAbsPath = path.posix.join(path.posix.dirname(oldPosixPath), importPath);
    const normalizedAbsPath = path.posix.normalize(resolvedAbsPath);

    let targetNewPath = null;
    
    for (const [oldP, newP] of absoluteMap.entries()) {
      if (oldP === normalizedAbsPath || oldP === normalizedAbsPath + '.tsx' || oldP === normalizedAbsPath + '.ts') {
        targetNewPath = newP;
        break;
      }
    }

    if (targetNewPath) {
      let newRel = getRelativePath(currentPosixPath, targetNewPath);
      if (!importPath.endsWith('.tsx') && !importPath.endsWith('.ts')) {
        newRel = newRel.replace(/\.tsx?$/, '');
      }
      changed = true;
      return match.replace(importPath, newRel);
    } else {
      if (originalFileMovesObj) { 
         let targetUnmovedPath = normalizedAbsPath; 
         let newRel = getRelativePath(currentPosixPath, targetUnmovedPath);
         if (!importPath.endsWith('.tsx') && !importPath.endsWith('.ts')) {
            newRel = newRel.replace(/\.tsx?$/, '');
         }
         changed = true;
         return match.replace(importPath, newRel);
      }
    }

    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${currentPosixPath}`);
  }
}

function processAllFiles() {
  function walk(dir, currentRelPath = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relPath = currentRelPath === '' ? file : currentRelPath + '/' + file;
      
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath, relPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        updateImports(fullPath, relPath);
      }
    }
  }
  
  walk(srcDir);
}

createDirs();
moveFiles();
processAllFiles();

// Remove old empty directories
try { fs.rmdirSync(path.join(srcDir, 'components/AdminDashboard/Ui')); } catch(e){}
try { fs.rmdirSync(path.join(srcDir, 'components/AdminDashboard/lib')); } catch(e){}
try { fs.rmdirSync(path.join(srcDir, 'components/AdminDashboard')); } catch(e){}

console.log('Done!');
