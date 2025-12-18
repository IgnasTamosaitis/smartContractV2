// Web3 and Contract instances
let web3;
let account;
let contractInstance;
let contractFactory;

// Deployed Contract Address
// Ganache Local (FRESH): 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
// Sepolia Testnet: 0xeF9D744ADc74eeC3E8C81F598A0FA93d36CC4515
const DEPLOYED_CONTRACT_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'; // Using Ganache

// Contract ABI - will be loaded from build folder
const CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "address payable", "name": "_tenant", "type": "address"},
            {"internalType": "address", "name": "_arbiter", "type": "address"},
            {"internalType": "uint256", "name": "_monthlyRent", "type": "uint256"},
            {"internalType": "uint256", "name": "_deposit", "type": "uint256"},
            {"internalType": "uint256", "name": "_durationMonths", "type": "uint256"},
            {"internalType": "string", "name": "_propertyAddress", "type": "string"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "address", "name": "tenant", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "DepositPaid",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "address", "name": "tenant", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "DepositReturned",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "address", "name": "by", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
        ],
        "name": "DisputeRaised",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "tenantAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "landlordAmount", "type": "uint256"}
        ],
        "name": "DisputeResolved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "startDate", "type": "uint256"}
        ],
        "name": "RentalActivated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
        ],
        "name": "RentalCancelled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "endDate", "type": "uint256"}
        ],
        "name": "RentalCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "address", "name": "landlord", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "tenant", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "monthlyRent", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "deposit", "type": "uint256"}
        ],
        "name": "RentalCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "address", "name": "tenant", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "date", "type": "uint256"}
        ],
        "name": "RentPaid",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "cancelRental",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "completeRental",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDaysUntilEnd",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRentalInfo",
        "outputs": [
            {"internalType": "address", "name": "landlord", "type": "address"},
            {"internalType": "address", "name": "tenant", "type": "address"},
            {"internalType": "address", "name": "arbiter", "type": "address"},
            {"internalType": "uint256", "name": "monthlyRent", "type": "uint256"},
            {"internalType": "uint256", "name": "deposit", "type": "uint256"},
            {"internalType": "uint256", "name": "startDate", "type": "uint256"},
            {"internalType": "uint256", "name": "endDate", "type": "uint256"},
            {"internalType": "uint256", "name": "lastPaymentDate", "type": "uint256"},
            {"internalType": "enum RentalAgreement.State", "name": "state", "type": "uint8"},
            {"internalType": "bool", "name": "depositReturned", "type": "bool"},
            {"internalType": "string", "name": "propertyAddress", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isRentDue",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "payDepositAndFirstRent",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "payMonthlyRent",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_reason", "type": "string"}],
        "name": "raiseDispute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rental",
        "outputs": [
            {"internalType": "address payable", "name": "landlord", "type": "address"},
            {"internalType": "address payable", "name": "tenant", "type": "address"},
            {"internalType": "address", "name": "arbiter", "type": "address"},
            {"internalType": "uint256", "name": "monthlyRent", "type": "uint256"},
            {"internalType": "uint256", "name": "deposit", "type": "uint256"},
            {"internalType": "uint256", "name": "startDate", "type": "uint256"},
            {"internalType": "uint256", "name": "endDate", "type": "uint256"},
            {"internalType": "uint256", "name": "lastPaymentDate", "type": "uint256"},
            {"internalType": "enum RentalAgreement.State", "name": "state", "type": "uint8"},
            {"internalType": "bool", "name": "depositReturned", "type": "bool"},
            {"internalType": "string", "name": "propertyAddress", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_tenantPercentage", "type": "uint256"}],
        "name": "resolveDispute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "returnDeposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Bytecode for contract deployment (will be filled after compilation)
let CONTRACT_BYTECODE = '';

// State names
const STATE_NAMES = {
    0: 'CREATED',
    1: 'ACTIVE',
    2: 'PAYMENT_PENDING',
    3: 'COMPLETED',
    4: 'DISPUTED',
    5: 'CANCELLED'
};

// Initialize - Wait for MetaMask to load
window.addEventListener('load', async () => {
    // MetaMask detection with retry
    let retries = 0;
    const maxRetries = 5;
    
    while (typeof window.ethereum === 'undefined' && retries < maxRetries) {
        console.log(`⏳ Waiting for MetaMask... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
    }
    
    await initWeb3();
    setupEventListeners();
    setupTabs();
    
    // Auto-load deployed contract if available
    if (DEPLOYED_CONTRACT_ADDRESS) {
        setTimeout(() => {
            const viewInput = document.getElementById('viewContractAddress');
            const manageInput = document.getElementById('contractAddress');
            if (viewInput) viewInput.value = DEPLOYED_CONTRACT_ADDRESS;
            if (manageInput) manageInput.value = DEPLOYED_CONTRACT_ADDRESS;
        }, 500);
    }
});

// Initialize Web3
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountChange);
        window.ethereum.on('chainChanged', () => window.location.reload());
        
        // Try to load bytecode from build folder
        try {
            const response = await fetch('../build/contracts/RentalAgreement.json');
            const contractJson = await response.json();
            CONTRACT_BYTECODE = contractJson.bytecode;
        } catch (error) {
            console.log('Could not load contract bytecode:', error);
        }
        
        console.log('✅ Web3 initialized successfully');
        console.log('✅ MetaMask detected');
    } else {
        console.error('❌ MetaMask not found');
        showNotification('MetaMask not detected', 'Please install MetaMask extension to use this DApp', 'error');
    }
}

// Connect MetaMask
async function connectMetaMask() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        
        updateConnectionStatus(true);
        await updateAccountInfo();
        
        showNotification('Connected!', `Connected to ${account.substring(0, 6)}...${account.substring(38)}`, 'success');
    } catch (error) {
        showNotification('Connection Error', error.message, 'error');
    }
}

// Handle account change
function handleAccountChange(accounts) {
    if (accounts.length === 0) {
        updateConnectionStatus(false);
    } else {
        account = accounts[0];
        updateAccountInfo();
    }
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusDiv = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    const connectBtn = document.getElementById('connectBtn');
    const accountInfo = document.getElementById('accountInfo');
    
    if (connected) {
        statusDiv.classList.remove('disconnected');
        statusDiv.classList.add('connected');
        statusText.textContent = 'Connected';
        connectBtn.style.display = 'none';
        accountInfo.classList.remove('hidden');
    } else {
        statusDiv.classList.remove('connected');
        statusDiv.classList.add('disconnected');
        statusText.textContent = 'Not Connected';
        connectBtn.style.display = 'block';
        accountInfo.classList.add('hidden');
    }
}

// Update account info
async function updateAccountInfo() {
    document.getElementById('accountAddress').textContent = account;
    
    const balance = await web3.eth.getBalance(account);
    document.getElementById('accountBalance').textContent = web3.utils.fromWei(balance, 'ether');
    
    const networkId = await web3.eth.net.getId();
    const networkNames = {
        1: 'Ethereum Mainnet',
        11155111: 'Sepolia Testnet',
        5777: 'Ganache Local'
    };
    document.getElementById('networkName').textContent = networkNames[networkId] || `Network ID: ${networkId}`;
}

// Create Rental Contract
async function createRental(event) {
    event.preventDefault();
    
    if (!account) {
        showNotification('Not Connected', 'Please connect MetaMask first', 'error');
        return;
    }
    
    const tenantAddress = document.getElementById('tenantAddress').value;
    const arbiterAddress = document.getElementById('arbiterAddress').value;
    const monthlyRent = web3.utils.toWei(document.getElementById('monthlyRent').value, 'ether');
    const deposit = web3.utils.toWei(document.getElementById('deposit').value, 'ether');
    const duration = document.getElementById('duration').value;
    const propertyAddress = document.getElementById('propertyAddress').value;
    
    try {
        showNotification('Creating Contract...', 'Please confirm the transaction in MetaMask', 'info');
        
        const contract = new web3.eth.Contract(CONTRACT_ABI);
        const deployedContract = await contract.deploy({
            data: CONTRACT_BYTECODE,
            arguments: [tenantAddress, arbiterAddress, monthlyRent, deposit, duration, propertyAddress]
        }).send({ from: account });
        
        const contractAddress = deployedContract.options.address;
        
        showNotification('Success!', `Contract created at: ${contractAddress}`, 'success');
        document.getElementById('createRentalForm').reset();
        
        // Save to localStorage
        saveContractAddress(contractAddress);
        
    } catch (error) {
        showNotification('Error', error.message, 'error');
    }
}

// Load Contract
async function loadContract(address) {
    if (!account) {
        showNotification('Error', 'Please connect MetaMask first', 'error');
        return;
    }
    
    try {
        contractInstance = new web3.eth.Contract(CONTRACT_ABI, address);
        
        // Test if contract exists
        const info = await contractInstance.methods.getRentalInfo().call();
        
        document.getElementById('contractActions').classList.remove('hidden');
        showNotification('Success', 'Contract loaded successfully!', 'success');
        
        // Update UI with contract info
        await updateContractUI(info);
        
        saveContractAddress(address);
        
    } catch (error) {
        console.error('Load contract error:', error);
        showNotification('Error', 'Invalid contract address or contract not found', 'error');
    }
}

// Update Contract UI with current state
async function updateContractUI(info) {
    const stateText = STATE_NAMES[info.state];
    const depositStatus = info.depositReturned ? 'Returned ✅' : 'In Contract 🔒';
    
    // Update status indicators
    const statusHtml = `
        <div class="status-info">
            <p><strong>State:</strong> ${stateText}</p>
            <p><strong>Deposit Status:</strong> ${depositStatus}</p>
            <p><strong>Monthly Rent:</strong> ${web3.utils.fromWei(info.monthlyRent, 'ether')} ETH</p>
        </div>
    `;
    
    const actionsDiv = document.getElementById('contractActions');
    let statusDiv = actionsDiv.querySelector('.status-info');
    if (!statusDiv) {
        actionsDiv.insertAdjacentHTML('afterbegin', statusHtml);
    } else {
        statusDiv.innerHTML = statusHtml.match(/<div class="status-info">(.*?)<\/div>/s)[1];
    }
}

// Pay Deposit and First Rent
async function payDepositAndFirstRent() {
    if (!contractInstance) {
        showNotification('Error', 'Please load a contract first', 'error');
        return;
    }
    
    try {
        const info = await contractInstance.methods.getRentalInfo().call();
        
        // Check if caller is tenant
        if (account.toLowerCase() !== info.tenant.toLowerCase()) {
            showNotification('Error', `Only Tenant can pay! Current account: ${account.substring(0,10)}... Expected Tenant: ${info.tenant.substring(0,10)}...`, 'error');
            return;
        }
        
        // Check state
        const stateNames = ['CREATED', 'ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
        if (info.state !== '0') {
            showNotification('Error', `Contract must be in CREATED state. Current state: ${stateNames[info.state]}`, 'error');
            return;
        }
        
        const totalAmount = BigInt(info.deposit) + BigInt(info.monthlyRent);
        const ethAmount = web3.utils.fromWei(totalAmount.toString(), 'ether');
        
        showNotification('Processing...', `Sending ${ethAmount} ETH. Please confirm in MetaMask`, 'info');
        
        await contractInstance.methods.payDepositAndFirstRent().send({
            from: account,
            value: totalAmount.toString()
        });
        
        showNotification('Success!', `Paid ${ethAmount} ETH - Contract is now ACTIVE!`, 'success');
        
    } catch (error) {
        console.error('Full error:', error);
        showNotification('Error', error.message, 'error');
    }
}

// Pay Monthly Rent
async function payMonthlyRent() {
    if (!contractInstance) {
        showNotification('Error', 'Please load a contract first', 'error');
        return;
    }
    
    try {
        const info = await contractInstance.methods.getRentalInfo().call();
        
        // Check if caller is tenant
        if (account.toLowerCase() !== info.tenant.toLowerCase()) {
            showNotification('Error', `Only Tenant can pay rent! Switch to Tenant account: ${info.tenant.substring(0,10)}...`, 'error');
            return;
        }
        
        // Check state
        const stateNames = ['CREATED', 'ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
        if (info.state !== '1') { // Must be ACTIVE
            showNotification('Error', `Contract must be ACTIVE. Current state: ${stateNames[info.state]}. First pay deposit!`, 'error');
            return;
        }
        
        const ethAmount = web3.utils.fromWei(info.monthlyRent, 'ether');
        showNotification('Processing...', `Sending ${ethAmount} ETH. Please confirm in MetaMask`, 'info');
        
        await contractInstance.methods.payMonthlyRent().send({
            from: account,
            value: info.monthlyRent
        });
        
        showNotification('Success!', `Paid ${ethAmount} ETH monthly rent!`, 'success');
        
    } catch (error) {
        console.error('Full error:', error);
        showNotification('Error', error.message, 'error');
    }
}

// Complete Rental
async function completeRental() {
    if (!contractInstance) return;
    
    try {
        const info = await contractInstance.methods.getRentalInfo().call();
        const stateNames = ['CREATED', 'ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
        
        if (info.state !== '1') {
            showNotification('Error', `Contract must be ACTIVE. Current state: ${stateNames[info.state]}`, 'error');
            return;
        }
        
        if (account.toLowerCase() !== info.landlord.toLowerCase() && account.toLowerCase() !== info.tenant.toLowerCase()) {
            showNotification('Error', 'Only Landlord or Tenant can complete rental', 'error');
            return;
        }
        
        await contractInstance.methods.completeRental().send({ from: account });
        showNotification('Success!', 'Rental completed! Landlord can now return deposit', 'success');
    } catch (error) {
        console.error('Full error:', error);
        showNotification('Error', error.message, 'error');
    }
}

// Return Deposit
async function returnDeposit() {
    if (!contractInstance) return;
    
    try {
        const info = await contractInstance.methods.getRentalInfo().call();
        const stateNames = ['CREATED', 'ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
        
        if (account.toLowerCase() !== info.landlord.toLowerCase()) {
            showNotification('Error', `Only Landlord can return deposit! Switch to Landlord: ${info.landlord.substring(0,10)}...`, 'error');
            return;
        }
        
        if (info.state !== '3') {
            showNotification('Error', `Contract must be COMPLETED. Current state: ${stateNames[info.state]}`, 'error');
            return;
        }
        
        await contractInstance.methods.returnDeposit().send({ from: account });
        showNotification('Success!', 'Deposit returned to tenant', 'success');
    } catch (error) {
        showNotification('Error', error.message, 'error');
    }
}

// Cancel Rental
async function cancelRental() {
    if (!contractInstance) return;
    
    try {
        const info = await contractInstance.methods.getRentalInfo().call();
        const stateNames = ['CREATED', 'ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
        
        if (account.toLowerCase() !== info.landlord.toLowerCase()) {
            showNotification('Error', `Only Landlord can cancel! Switch to Landlord: ${info.landlord.substring(0,10)}...`, 'error');
            return;
        }
        
        if (info.state !== '0') {
            showNotification('Error', `Can only cancel CREATED contracts. Current state: ${stateNames[info.state]}`, 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to cancel this rental contract?')) return;
        
        await contractInstance.methods.cancelRental().send({ from: account });
        showNotification('Success!', 'Rental cancelled', 'success');
    } catch (error) {
        showNotification('Error', error.message, 'error');
    }
}

// Raise Dispute
async function raiseDispute() {
    if (!contractInstance) return;
    
    const reason = document.getElementById('disputeReason').value;
    if (!reason) {
        showNotification('Error', 'Please enter a dispute reason', 'error');
        return;
    }
    
    try {
        await contractInstance.methods.raiseDispute(reason).send({ from: account });
        showNotification('Success!', 'Dispute raised', 'success');
    } catch (error) {
        showNotification('Error', error.message, 'error');
    }
}

// Resolve Dispute
async function resolveDispute() {
    if (!contractInstance) return;
    
    const percentage = document.getElementById('tenantPercentage').value;
    if (!percentage || percentage < 0 || percentage > 100) {
        showNotification('Error', 'Please enter a valid percentage (0-100)', 'error');
        return;
    }
    
    try {
        await contractInstance.methods.resolveDispute(percentage).send({ from: account });
        showNotification('Success!', 'Dispute resolved', 'success');
    } catch (error) {
        showNotification('Error', error.message, 'error');
    }
}

// View Contract Details
async function viewContractDetails() {
    if (!account) {
        showNotification('Error', 'Please connect MetaMask first', 'error');
        return;
    }
    
    const address = document.getElementById('viewContractAddress').value;
    
    if (!web3.utils.isAddress(address)) {
        showNotification('Error', 'Invalid contract address', 'error');
        return;
    }
    
    try {
        const contract = new web3.eth.Contract(CONTRACT_ABI, address);
        const info = await contract.methods.getRentalInfo().call();
        const balance = await contract.methods.getContractBalance().call();
        const daysLeft = await contract.methods.getDaysUntilEnd().call();
        
        // Display info
        document.getElementById('detailLandlord').textContent = info.landlord;
        document.getElementById('detailTenant').textContent = info.tenant;
        document.getElementById('detailArbiter').textContent = info.arbiter;
        document.getElementById('detailMonthlyRent').textContent = web3.utils.fromWei(info.monthlyRent, 'ether') + ' ETH';
        document.getElementById('detailDeposit').textContent = web3.utils.fromWei(info.deposit, 'ether') + ' ETH';
        document.getElementById('detailPropertyAddress').textContent = info.propertyAddress;
        document.getElementById('detailStartDate').textContent = info.startDate > 0 ? new Date(info.startDate * 1000).toLocaleString() : 'Not started';
        document.getElementById('detailEndDate').textContent = new Date(info.endDate * 1000).toLocaleString();
        
        const stateSpan = document.getElementById('detailState');
        stateSpan.textContent = STATE_NAMES[info.state];
        stateSpan.className = 'badge ' + STATE_NAMES[info.state].toLowerCase();
        
        document.getElementById('detailDepositReturned').textContent = info.depositReturned ? 'Yes' : 'No';
        document.getElementById('detailBalance').textContent = web3.utils.fromWei(balance, 'ether') + ' ETH';
        document.getElementById('detailDaysLeft').textContent = daysLeft + ' days';
        
        document.getElementById('contractDetails').classList.remove('hidden');
        
    } catch (error) {
        showNotification('Error', 'Could not load contract details: ' + error.message, 'error');
    }
}

// Save contract address to localStorage
function saveContractAddress(address) {
    let contracts = JSON.parse(localStorage.getItem('rentalContracts') || '[]');
    if (!contracts.includes(address)) {
        contracts.push(address);
        localStorage.setItem('rentalContracts', JSON.stringify(contracts));
    }
}

// Show notification
function showNotification(title, message, type = 'info') {
    const notificationDiv = document.getElementById('notifications');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <h4>${title}</h4>
        <p>${message}</p>
    `;
    
    notificationDiv.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('connectBtn').addEventListener('click', connectMetaMask);
    document.getElementById('createRentalForm').addEventListener('submit', createRental);
    document.getElementById('loadContractBtn').addEventListener('click', () => {
        const address = document.getElementById('contractAddress').value;
        if (address) {
            loadContract(address);
        } else {
            showNotification('Error', 'Please enter a contract address', 'error');
        }
    });
    
    document.getElementById('payDepositBtn').addEventListener('click', payDepositAndFirstRent);
    document.getElementById('payRentBtn').addEventListener('click', payMonthlyRent);
    document.getElementById('completeRentalBtn').addEventListener('click', completeRental);
    document.getElementById('returnDepositBtn').addEventListener('click', returnDeposit);
    document.getElementById('cancelRentalBtn').addEventListener('click', cancelRental);
    document.getElementById('raiseDisputeBtn').addEventListener('click', raiseDispute);
    document.getElementById('resolveDisputeBtn').addEventListener('click', resolveDispute);
    document.getElementById('viewContractBtn').addEventListener('click', viewContractDetails);
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}
