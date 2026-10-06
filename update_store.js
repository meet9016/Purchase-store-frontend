
const fs = require('fs');
const path = './src/lib/storeData.ts';
let content = fs.readFileSync(path, 'utf8');

const startString = '// ==========================================\r\n// RICH REALISTIC SEED DATA FOR STANDALONE DEMO\r\n// ==========================================';
const startIndex = content.indexOf(startString);
if (startIndex === -1) {
    const fallbackStart = '// ==========================================\n// RICH REALISTIC SEED DATA FOR STANDALONE DEMO\n// ==========================================';
    if (content.indexOf(fallbackStart) > -1) {
        content = content.replace(fallbackStart, '');
    }
}

const endIndex = content.indexOf('export interface DatabaseState');
if (startIndex > -1 && endIndex > -1) {
  let sub = content.substring(0, endIndex);
  let lastBracket = sub.lastIndexOf('];');
  if (lastBracket > startIndex) {
    content = content.substring(0, startIndex) + '\n\nconst DB_KEY = \'purchase_store_enterprise_db_v2\';\n\n' + content.substring(endIndex);
  }
} else if (endIndex > -1) {
    // maybe it has \n instead of \r\n
    const startStr = '// ==========================================\n// RICH REALISTIC SEED DATA FOR STANDALONE DEMO\n// ==========================================';
    const sIdx = content.indexOf(startStr);
    if (sIdx > -1) {
        let sub = content.substring(0, endIndex);
        let lastBracket = sub.lastIndexOf('];');
        if (lastBracket > sIdx) {
            content = content.substring(0, sIdx) + '\n\nconst DB_KEY = \'purchase_store_enterprise_db_v2\';\n\n' + content.substring(endIndex);
        }
    }
}

content = content.replace(/function getInitialSeed\(\): DatabaseState \{[\s\S]*?\}/m, 'function getInitialSeed(): DatabaseState {\n  return {\n    users: [],\n    projects: [],\n    vendors: [],\n    categories: [],\n    units: [],\n    items: [],\n    purchaseRequests: [],\n    purchaseOrders: [],\n    grns: [],\n    stock: [],\n    stockTransactions: [],\n    storeOutwards: [],\n    vendorBills: [],\n    paymentRequests: [],\n    paymentEntries: [],\n    auditLogs: [],\n    notifications: [],\n    rolePermissions: []\n  };\n}');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated storeData.ts');

