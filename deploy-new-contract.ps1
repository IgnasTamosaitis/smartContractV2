# Deploy New Contract and Update Frontend
Write-Host "`n🚀 Deploying New Contract to Ganache..." -ForegroundColor Cyan

# Run truffle migrate
$output = truffle migrate --network development --reset 2>&1 | Out-String

# Extract contract address from output
if ($output -match "contract address:\s+(0x[a-fA-F0-9]{40})") {
    $newAddress = $matches[1]
    Write-Host "`n✅ Contract Deployed: $newAddress" -ForegroundColor Green
    
    # Update app.js
    $appJsPath = "client\app.js"
    $appJsContent = Get-Content $appJsPath -Raw
    $appJsContent = $appJsContent -replace "const DEPLOYED_CONTRACT_ADDRESS = '0x[a-fA-F0-9]{40}';", "const DEPLOYED_CONTRACT_ADDRESS = '$newAddress';"
    $appJsContent | Set-Content $appJsPath -NoNewline
    
    # Update index.html - Manage tab input
    $indexPath = "client\index.html"
    $indexContent = Get-Content $indexPath -Raw
    $indexContent = $indexContent -replace 'id="contractAddress" placeholder="0x\.\.\." value="0x[a-fA-F0-9]{40}"', "id=`"contractAddress`" placeholder=`"0x...`" value=`"$newAddress`""
    
    # Update index.html - View tab input
    $indexContent = $indexContent -replace 'id="viewContractAddress" placeholder="0x\.\.\." value="0x[a-fA-F0-9]{40}"', "id=`"viewContractAddress`" placeholder=`"0x...`" value=`"$newAddress`""
    
    # Update index.html - Manage tab banner
    $indexContent = $indexContent -replace '<code>0x[a-fA-F0-9]{40}</code>', "<code>$newAddress</code>"
    
    $indexContent | Set-Content $indexPath -NoNewline
    
    Write-Host "`n📝 Updated Files:" -ForegroundColor Yellow
    Write-Host "   ✅ client\app.js"
    Write-Host "   ✅ client\index.html"
    Write-Host "`n🎯 Next Steps:"
    Write-Host "   1. Refresh browser (Ctrl+Shift+R)"
    Write-Host "   2. Load Contract"
    Write-Host "   3. Start testing!"
    Write-Host "`n📋 New Contract: $newAddress`n"
    
}
else {
    Write-Host "`n❌ Failed to extract contract address from output" -ForegroundColor Red
    Write-Host $output
}
