const { execSync } = require('child_process');
try {
  const result = execSync('dotnet build "D:\\Projects\\Bomilact\\repos\\BomilactERP\\BomilactERP.api\\BomilactERP.api.csproj"', { encoding: 'utf8', timeout: 120000 });
  console.log(result);
} catch (e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
