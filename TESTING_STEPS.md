# 🧪 Testing Steps - Ganache Local Testing

## ⚠️ SVARBU - Ganache Accounts

Turite **3 accounts** Ganache (kiekvienas turi 1000 ETH):

| Role                     | Address                                      | Private Key                                                          |
| ------------------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| **Landlord** (Account 0) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Tenant** (Account 1)   | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Arbiter** (Account 2)  | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

---

## 🔧 Setup (jei dar nepadaryta)

### 1. MetaMask Network Setup

**Add Ganache Network:**

- Network Name: `Localhost 7545`
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Currency Symbol: `ETH`

### 2. Import Accounts to MetaMask

**Import Tenant (Account 1):**

1. MetaMask → Account icon → Import Account
2. Paste: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
3. Pavadinkit "Tenant"

**Import Arbiter (Account 2):**

1. MetaMask → Account icon → Import Account
2. Paste: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
3. Pavadinkit "Arbiter"

---

## 🎬 Testing Scenarios

### ✅ Scenario 1: Happy Path

#### Step 1: Tenant Pays Deposit

1. **MetaMask:** Switch to **Tenant** account (0x7099...)
2. **Browser:** Refresh http://localhost:8080
3. Click **"Load Contract"**
4. Click **"💰 Pay Deposit + First Rent (0.03 ETH)"**
5. MetaMask will ask for **0.03 ETH** - confirm
6. ✅ Contract is now **ACTIVE**

#### Step 2: Wait or Skip Time (Testing)

**Option A - Real Wait:** Laukti 25 dienų (realiai)
**Option B - Ganache Time Travel:**

```powershell
# Advance Ganache time by 26 days
curl http://127.0.0.1:7545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"evm_increaseTime","params":[2246400],"id":1}'
curl http://127.0.0.1:7545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"evm_mine","id":1}'
```

#### Step 3: Tenant Pays Monthly Rent

1. **MetaMask:** Still as **Tenant**
2. Click **"📅 Pay Monthly Rent (0.01 ETH)"**
3. Confirm **0.01 ETH**
4. ✅ Rent paid!

#### Step 4: Skip to End of Contract

```powershell
# Advance 6 months (180 days)
curl http://127.0.0.1:7545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"evm_increaseTime","params":[15552000],"id":1}'
curl http://127.0.0.1:7545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"evm_mine","id":1}'
```

#### Step 5: Complete Rental (Landlord or Tenant)

1. **MetaMask:** Switch to **Landlord** (0xf39F... - Account 0)
2. **Browser:** Refresh page → Load Contract
3. Click **"Complete Rental"**
4. ✅ Contract is now **COMPLETED**

#### Step 6: Return Deposit (Landlord)

1. **MetaMask:** Still as **Landlord**
2. Click **"Return Deposit"**
3. ✅ Tenant gauna 0.02 ETH atgal!

---

### ⚖️ Scenario 2: Dispute Resolution

#### Steps 1-3: Same as Happy Path

(Tenant pays deposit, pays rent)

#### Step 4: Raise Dispute

1. **MetaMask:** Switch to **Tenant** (or Landlord)
2. Type dispute reason: "Property damage"
3. Click **"Raise Dispute"**
4. ✅ Contract is now **DISPUTED**

#### Step 5: Arbiter Resolves

1. **MetaMask:** Switch to **Arbiter** (0x3C44... - Account 2)
2. **Browser:** Refresh → Load Contract
3. Enter percentage (e.g., `70` means Tenant gets 70%, Landlord 30%)
4. Click **"Resolve Dispute (Arbiter)"**
5. ✅ Deposit split: Tenant: 0.014 ETH, Landlord: 0.006 ETH

---

### ❌ Scenario 3: Cancellation (Before Activation)

#### Step 1: Cancel Immediately

1. **MetaMask:** Switch to **Landlord**
2. Load contract (should be CREATED state)
3. Click **"Cancel Contract"**
4. ✅ Contract is **CANCELLED**

**Note:** Can only cancel if Tenant hasn't paid deposit yet!

---

## 🐛 Troubleshooting

### Error: "Transaction reverted"

**Possible reasons:**

1. **Wrong account:**

   - "Pay Deposit" → Must be **Tenant**
   - "Complete/Return/Cancel" → Must be **Landlord**
   - "Resolve Dispute" → Must be **Arbiter**

2. **Wrong state:**

   - Check contract state in "View Contract" tab
   - Follow the state flow: CREATED → ACTIVE → COMPLETED

3. **Time constraints:**
   - Can't pay monthly rent < 25 days after last payment
   - Can't complete before end date (6 months)

### Error: "Cannot read properties of undefined"

- Ensure contract is loaded (click "Load Contract")
- Check MetaMask is connected to **Localhost 7545**
- Verify Ganache is running on port 7545

---

## 📊 Check Results

### View Contract State

- Go to **"View Contract"** tab
- Click **"View Details"**
- See:
  - Current State (CREATED/ACTIVE/COMPLETED/etc)
  - Landlord, Tenant, Arbiter addresses
  - Contract balance
  - Dates and amounts

### Check Balances

In MetaMask, check each account balance:

- Landlord: Should receive rent payments
- Tenant: Should spend deposit+rent, get deposit back
- Arbiter: No balance changes (unless dispute resolved)

---

## 🎯 Success Criteria

✅ Tenant successfully pays 0.03 ETH deposit  
✅ Contract changes from CREATED → ACTIVE  
✅ Monthly rent payment works (0.01 ETH)  
✅ Contract can be completed after end date  
✅ Deposit returns to Tenant (0.02 ETH)  
✅ Dispute can be raised and resolved  
✅ All state transitions work correctly

---

**Need help?** Check browser console (F12) for detailed error messages!
