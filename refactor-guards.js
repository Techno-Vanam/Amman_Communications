const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/api/src');

function getRelativePathToAuth(filePath) {
  const depth = filePath.split(path.sep).length - srcDir.split(path.sep).length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return prefix + 'auth';
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.controller.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      const authPath = getRelativePathToAuth(fullPath);

      // Check for AdminAuthGuard
      if (content.includes('AdminAuthGuard')) {
        content = content.replace(/import { AdminAuthGuard } from '[^']+';\n?/g, '');
        content = content.replace(/@UseGuards\(AdminAuthGuard\)/g, `@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('ADMIN')`);
        changed = true;
      }

      // Check for CustomerAuthGuard
      if (content.includes('CustomerAuthGuard')) {
        content = content.replace(/import { CustomerAuthGuard } from '[^']+';\n?/g, '');
        content = content.replace(/@UseGuards\(CustomerAuthGuard\)/g, `@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('CUSTOMER')`);
        changed = true;
      }

      if (changed) {
        // Add new imports
        const imports = `import { JwtAuthGuard } from '${authPath}/guards/jwt-auth.guard';\nimport { RolesGuard } from '${authPath}/guards/roles.guard';\nimport { Roles } from '${authPath}/decorators/roles.decorator';\n`;
        
        // Find the last import statement
        const importMatches = [...content.matchAll(/^import .* from '.*';/gm)];
        if (importMatches.length > 0) {
          const lastImport = importMatches[importMatches.length - 1];
          const insertPos = lastImport.index + lastImport[0].length;
          content = content.slice(0, insertPos) + '\n' + imports + content.slice(insertPos);
        } else {
          content = imports + '\n' + content;
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Refactored ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
