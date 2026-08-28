const http = require('http');
const fs = require('fs');
const path = require('path');

http.get('http://localhost:3003/docs-json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const swagger = JSON.parse(data);
      let markdown = '# Amman Communications - Backend Endpoints API Documentation\n\n';
      markdown += 'This document provides a comprehensive overview of all backend API endpoints, grouped by tags.\n\n';

      const paths = swagger.paths;
      const tagsMap = {};

      // Group by tags
      for (const [endpointPath, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods)) {
          const tags = details.tags || ['General'];
          for (const tag of tags) {
            if (!tagsMap[tag]) tagsMap[tag] = [];
            tagsMap[tag].push({
              path: endpointPath,
              method: method.toUpperCase(),
              summary: details.summary || '',
              description: details.description || '',
              parameters: details.parameters || [],
              responses: details.responses || {}
            });
          }
        }
      }

      for (const [tag, endpoints] of Object.entries(tagsMap).sort((a, b) => a[0].localeCompare(b[0]))) {
        markdown += `## ${tag}\n\n`;
        
        for (const ep of endpoints) {
          markdown += `### \`${ep.method}\` ${ep.path}\n\n`;
          if (ep.summary) markdown += `**Summary**: ${ep.summary}\n\n`;
          if (ep.description) markdown += `${ep.description}\n\n`;
          
          if (ep.parameters.length > 0) {
            markdown += `**Parameters:**\n`;
            markdown += `| Name | In | Required | Type | Description |\n`;
            markdown += `|---|---|---|---|---|\n`;
            for (const param of ep.parameters) {
              const type = param.schema ? (param.schema.type || 'any') : 'any';
              markdown += `| \`${param.name}\` | ${param.in} | ${param.required ? 'Yes' : 'No'} | \`${type}\` | ${param.description || ''} |\n`;
            }
            markdown += `\n`;
          }

          markdown += `**Responses:**\n`;
          for (const [status, resDetails] of Object.entries(ep.responses)) {
            markdown += `- **${status}**: ${resDetails.description || ''}\n`;
          }
          markdown += `\n---\n\n`;
        }
      }

      fs.writeFileSync(path.join(process.cwd(), 'brain', '4cb0576a-7dd8-4f5f-989f-90f9af6a3470', 'backend_endpoints.md'), markdown);
      console.log('Successfully wrote backend_endpoints.md');
    } catch (e) {
      console.error('Failed to parse swagger', e);
    }
  });
}).on('error', err => {
  console.error('Request error', err);
});
