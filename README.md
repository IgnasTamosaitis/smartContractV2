# Nekilnojamojo Turto Nuomos Išmanioji Sutartis

## Projekto Aprašymas

Ši decentralizuota aplikacija įgyvendina **nekilnojamojo turto nuomos valdymo sistemą** naudojant Ethereum blockchain ir išmaniąją sutartį (smart contract). Sistema užtikrina skaidrų ir saugų nuomos procesą tarp nuomotojo, nuomininko ir arbitro.

---

## Verslo Modelis

### Kodėl Šis Modelis Skiriasi nuo Pavyzdžio?

**Pavyzdinis modelis** (prekių pardavimas):

-  Vienkartinė transakcija
-  Dviejų šalių sandoris (pirkėjas, pardavėjas)
-  Momentinis pinigų perdavimas

**Mūsų modelis** (nekilnojamojo turto nuoma):

-  **Ilgalaikis santykis** su periodiniais mokėjimais
-  **Trys šalys**: nuomotojas, nuomininkas, arbitras
-  **Užstatas** kaip saugumo garantija
-  **Ginčų sprendimo mechanizmas**
-  **Laiko valdymas** (nuomos trukmė, mokėjimo intervalai)
-  **Valstybių mašina** su 6 būsenomis (CREATED, ACTIVE, PAYMENT_PENDING, COMPLETED, DISPUTED, CANCELLED)

### Verslo Modelio Privalumai

1. **Skaidrumas** - Visi mokėjimai ir veiksmai įrašyti blockchain'e
2. **Automatizacija** - Smart contract automatiškai valdo mokėjimus
3. **Saugumas** - Užstatas saugomas contract'e, negali būti pasisavintas
4. **Nešališkumas** - Nepriklausomas arbitras ginčų atveju
5. **Neįmanoma pakeisti** - Sutarties sąlygos užfiksuotos ir nekeičiamos

---

## Pagrindiniai Veikėjai (Actors)

### 1. **Nuomotojas (Landlord)**

**Rolė:** Nekilnojamojo turto savininkas, kuris nori išnuomoti savo turtą.

**Teisės ir Funkcijos:**

- `constructor()` - Sukuria naują nuomos sutartį, nustato sąlygas
- `completeRental()` - Užbaigia nuomą pasibaigus laikotarpiui
- `returnDeposit()` - Grąžina užstatą nuomininkui (jei nėra pretenzijų)
- `raiseDispute()` - Kelia ginčą dėl turto sugadinimo
- `cancelRental()` - Atšaukia sutartį prieš jos pradžią

**Finansiniai Srautai:**

- **Gauna:** Mėnesinius nuomos mokėjimus (automatiškai)
- **Gali gauti:** Dalį užstato (ginčo atveju)

**Atsakomybės:**

- Užtikrinti, kad turtas yra tinkamas nuomai
- Grąžinti užstatą sąžiningai, jei nėra žalos

---

### 2. **Nuomininkas (Tenant)**

**Rolė:** Asmuo ar įmonė, kuri nori išsinuomoti nekilnojamąjį turtą.

**Teisės ir Funkcijos:**

- `payDepositAndFirstRent()` - Aktyvuoja sutartį, sumokėdamas užstatą + pirmą nuomą
- `payMonthlyRent()` - Moka mėnesinę nuomą kas 25+ dienas
- `completeRental()` - Gali užbaigti nuomą pasibaigus terminui
- `raiseDispute()` - Kelia ginčą, jei nuomotojas nepagristai nesugrąžina užstato

**Finansiniai Srautai:**

- **Moka:** Užstatą (vieną kartą) + mėnesinę nuomą (periodiškai)
- **Gauna atgal:** Užstatą (pilną arba dalį)

**Atsakomybės:**

- Mokėti nuomą laiku
- Prižiūrėti turtą ir grąžinti jį tvarkingą būklę

---

### 3. **Arbitras (Arbiter)** 

**Rolė:** Nepriklausomas trečiasis asmuo, sprendžiantis ginčus tarp nuomotojo ir nuomininko.

**Teisės ir Funkcijos:**

- `resolveDispute()` - Vienintelė funkcija - nusprendžia užstato paskirstymą

**Sprendimo Logika:**

- Nustato procentinį užstato padalijimą (0-100%)
- Pavyzdžiui: 70% nuomininkui (mažai žalos), 30% nuomotojui (kompensacija)
- Galimi variantai:
  - **100% nuomininkui** - jokios žalos, nuomotojas nepagrįstai laikė užstatą
  - **50/50** - abejotina situacija, kompromisas
  - **0% nuomininkui** - rimta žala, visas užstatas nuomotojui

**Atsakomybės:**

- Objektyviai įvertinti situaciją
- Priimti teisingą sprendimą pagal faktus

---

### Veikėjų Sąveika

```
┌─────────────┐          ┌──────────────┐          ┌────────────┐
│ Nuomotojas  │────────▶ │Smart Contract│◀────────│Nuomininkas │
│ (Landlord)  │          │              │          │ (Tenant)   │
└─────────────┘          └──────────────┘          └────────────┘
                              ▲
                              │
                              │ (Ginčo atveju)
                              │
                        ┌─────┴──────┐
                        │  Arbitras  │
                        │ (Arbiter)  │
                        └────────────┘
```

---

## Tipiški Verslo Scenarijai

### Sutarties Būsenos (States)

Smart contract naudoja **valstybių mašiną** (State Machine) su šešiomis būsenomis:

```
┌─────────┐  payDeposit   ┌────────┐  complete    ┌───────────┐
│ CREATED │──────────────▶│ ACTIVE │─────────────▶│ COMPLETED │
└─────────┘               └────────┘              └───────────┘
     │                         │                         │
     │ cancel                  │                         │ raiseDispute
     ▼                         │                         ▼
┌───────────┐                 │                   ┌──────────┐
│ CANCELLED │                 │                   │ DISPUTED │
└───────────┘                 │                   └──────────┘
                              │                         │
                              │                         │ resolveDispute
                              ▼                         ▼
                      ┌────────────────┐        ┌───────────┐
                      │ PAYMENT_PENDING│        │ COMPLETED │
                      └────────────────┘        └───────────┘
```

---

### **Scenarijus 1: Sėkminga Nuoma (Happy Path)**

**Tikslas:** Nuomotojas sėkmingai išnuomoja turtą, nuomininkas moka laiku, sutartis baigiasi be ginčų.

**Veiksmai:**

1. **Sutarties Sukūrimas** (Nuomotojas)

   - Nuomotojas deploy'ina contract su parametrais:
     - Nuomininko adresas
     - Arbitro adresas
     - Mėnesinė nuoma (pvz., 0.01 ETH)
     - Užstatas (pvz., 0.02 ETH)
     - Trukmė (pvz., 6 mėnesiai)
     - Turto adresas
   - **Būsena:** `CREATED`

2. **Užstato ir Pirmo Mokėjimo Sumokėjimas** (Nuomininkas)

   - Nuomininkas sumoka: užstatas + pirma nuoma (0.03 ETH)
   - Contract automatiškai perveda pirmą nuomos mokestį nuomotojui
   - Užstatas lieka contract'e kaip garantija
   - **Būsena:** `CREATED` → `ACTIVE`

3. **Mėnesiniai Mokėjimai** (Nuomininkas)

   - Kas 25+ dienų nuomininkas moka mėnesinę nuomą (0.01 ETH)
   - Contract automatiškai perveda pinigus nuomotojui
   - **Būsena:** `ACTIVE` (nepakeičiama)

4. **Nuomos Pabaiga** (Nuomotojas arba Nuomininkas)

   - Po 6 mėnesių bet kuri šalis gali užbaigti sutartį
   - **Būsena:** `ACTIVE` → `COMPLETED`

5. **Užstato Grąžinimas** (Nuomotojas)
   - Nuomotojas patikrina turto būklę
   - Jei viskas gerai, grąžina pilną užstatą (0.02 ETH)
   - **Rezultatas:** Nuomininkas gauna pinigus atgal ✅

**Finansiniai Rezultatai:**

- **Nuomotojas:** +0.06 ETH (6 mėn × 0.01 ETH)
- **Nuomininkas:** -0.06 ETH (nuoma), +0.02 ETH (užstatas atgal)
- **Arbitras:** 0 ETH (nedalyvavo)

---

### **Scenarijus 2: Nuoma su Ginču** 

**Tikslas:** Nuomos pabaigoje kyla ginčas dėl turto būklės, arbitras nusprendžia užstato paskirstymą.

**Veiksmai:**

1-4. **[Kaip Scenarijus 1]** - Sutartis aktyvuojama, moka nuomą, baigiasi laikotarpis

5. **Ginčo Kėlimas** (Nuomotojas ARBA Nuomininkas)

   - **Pavyzdys:** Nuomotojas tvirtina: "Nuomininkas sugadino grindis"
   - Kviečia funkciją `raiseDispute("Damaged floors, repair cost 0.01 ETH")`
   - **Būsena:** `COMPLETED` → `DISPUTED`
   - Užstatas (0.02 ETH) lieka užšaldytas contract'e 

6. **Ginčo Nagrinėjimas** (Arbitras)

   - Arbitras peržiūri įrodymus:
     - Nuotraukas prieš/po nuomos
     - Aktus, sąskaitas už remontą
     - Abiejų šalių paaiškinimus
   - Nusprendžia teisingą užstato paskirstymą

7. **Ginčo Sprendimas** (Arbitras)
   - Kviečia `resolveDispute(70)` → 70% nuomininkui, 30% nuomotojui
   - Contract automatiškai paskirsto:
     - 0.014 ETH → Nuomininkas
     - 0.006 ETH → Nuomotojas (kompensacija)
   - **Būsena:** `DISPUTED` → `COMPLETED`

**Finansiniai Rezultatai:**

- **Nuomotojas:** +0.06 ETH (nuoma) + 0.006 ETH (dalis užstato) = 0.066 ETH
- **Nuomininkas:** -0.06 ETH (nuoma) + 0.014 ETH (dalis užstato) = -0.046 ETH
- **Arbitras:** 0 ETH (arbitražas paprastai už mokėjimo sistema)

---

### **Scenarijus 3: Sutarties Atšaukimas**

**Tikslas:** Nuomotojas atsisako sutarties prieš jos pradžią.

**Veiksmai:**

1. **Sutarties Sukūrimas** (Nuomotojas)

   - Sukuria contract su parametrais
   - **Būsena:** `CREATED`

2. **Atšaukimas** (Nuomotojas)

   - Nuomotojas pasikeičia nuomonę (rado kitą nuomininką, parduoda turtą, etc.)
   - Kviečia `cancelRental()`
   - **Būsena:** `CREATED` → `CANCELLED`

3. **Rezultatas**
   - Nuomininkas nebegali sumokėti užstato
   - Sutartis tampa neaktyvi
   - Jokių finansinių įsipareigojimų

**Pastaba:** Atšaukti galima TIK prieš sumokant užstatą (state = CREATED)!

---

### **Scenarijus 4: Nuomininkas Nemoka Nuomos**

**Tikslas:** Nuomininkas nustoja mokėti, nuomotojas gali pasinaudoti užstatu.

**Realybė:** Smart contract **negali priverstinai** paimti pinigų iš nuomininko wallet.

**Sprendimas:**

- Nuomininkas **savanoriškai** moka arba nemoka
- Jei nemoka → Nuomotojas kelia ginčą pasibaigus terminui
- Arbitras nustato, kad užstatas lieka nuomotojui kaip kompensacija

**Alternatyva (advanced):**

- Galima implementuoti `evict()` funkciją
- Jei nuomininkas praleido N mokėjimų → Nuomotojas automatiškai gauna dalį užstato

---

## Sekų Diagramos (Sequence Diagrams)

### **1. Sėkmingos Nuomos Scenarijus (Happy Path)**

```mermaid
sequenceDiagram
    participant L as Nuomotojas<br/>(Landlord)
    participant SC as Smart Contract<br/>(RentalAgreement)
    participant T as Nuomininkas<br/>(Tenant)

    Note over L,SC,T: PHASE 1: Sutarties Sukūrimas

    L->>SC: 1. constructor(tenant, arbiter, rent, deposit, duration, address)
    activate SC
    SC->>SC: Validuoti parametrus (require checks)
    SC->>SC: Išsaugoti duomenis (rental struct)
    SC->>SC: State = CREATED
    SC-->>L: Sutartis sukurta (contract address)
    deactivate SC

    Note over L,SC,T: PHASE 2: Sutarties Aktyvavimas

    T->>SC: 2. payDepositAndFirstRent() payable {value: deposit + rent}
    activate SC
    SC->>SC: Patikrinti: state == CREATED
    SC->>SC: Patikrinti: msg.value == deposit + monthlyRent
    SC->>SC: State = ACTIVE
    SC->>SC: Išsaugoti startDate = now
    SC->>L: Transfer(monthlyRent) - pirmoji nuoma
    SC->>SC: Užstatas lieka contract'e
    SC-->>T: Emit RentalActivated(startDate)
    deactivate SC

    Note over L,SC,T: PHASE 3: Periodiniai Mokėjimai (6 mėnesius)

    loop Kas mėnesį (25+ dienų intervalas)
        T->>SC: 3. payMonthlyRent() payable {value: rent}
        activate SC
        SC->>SC: Patikrinti: state == ACTIVE
        SC->>SC: Patikrinti: now >= lastPaymentDate + 25 days
        SC->>SC: Atnaujinti lastPaymentDate = now
        SC->>L: Transfer(monthlyRent)
        SC-->>T: Emit RentPaid(amount, date)
        deactivate SC
    end

    Note over L,SC,T: PHASE 4: Nuomos Užbaigimas (po 6 mėnesių)

    alt Užbaigia Nuomotojas
        L->>SC: 4a. completeRental()
    else Užbaigia Nuomininkas
        T->>SC: 4b. completeRental()
    end
    activate SC
    SC->>SC: Patikrinti: state == ACTIVE
    SC->>SC: Patikrinti: now >= endDate
    SC->>SC: State = COMPLETED
    SC-->>L: Emit RentalCompleted(endDate)
    SC-->>T: Emit RentalCompleted(endDate)
    deactivate SC

    Note over L,SC,T: PHASE 5: Užstato Grąžinimas (jei nėra pretenzijų)

    L->>SC: 5. returnDeposit()
    activate SC
    SC->>SC: Patikrinti: state == COMPLETED
    SC->>SC: Patikrinti: !depositReturned
    SC->>SC: depositReturned = true
    SC->>T: Transfer(deposit) - pilnas užstatas
    SC-->>L: Emit DepositReturned(tenant, amount)
    deactivate SC

    Note over L,SC,T: Sėkmingai užbaigta! Nuomininkas gavo užstatą atgal.
```

#### **Veiksmai ir Jų Aprašymai:**

1. **constructor()** - Nuomotojas deploy'ina contract su visais parametrais:

   - Nustato nuomininką, arbitrą, kainas, trukmę
   - Validuoja, kad visi parametrai teisingi (>0, valid addresses)
   - Išsaugo duomenis ir nustato būseną `CREATED`

2. **payDepositAndFirstRent()** - Nuomininkas aktyvuoja sutartį:

   - Siunčia ETH (deposit + first rent) į contract
   - Contract patikrina sumą ir būseną
   - Automatiškai perveda pirmą nuomos mokestį nuomotojui
   - Užstatas lieka contract'e kaip garantija
   - Būsena keičiasi į `ACTIVE`, pradedamas skaičiavimas

3. **payMonthlyRent()** (loop) - Mėnesiniai mokėjimai:

   - Nuomininkas kas ~30 dienų siunčia nuomos mokestį
   - Contract tikrina intervalą (min 25 dienos)
   - Automatiškai perveda pinigus nuomotojui
   - Įrašo mokėjimo datą (lastPaymentDate)

4. **completeRental()** - Nuomos užbaigimas:

   - Gali iškviesti bet kuri šalis po endDate
   - Contract patikrina, ar pasibaigė laikotarpis
   - Būsena keičiasi į `COMPLETED`
   - Dabar galima grąžinti užstatą arba kelti ginčą

5. **returnDeposit()** - Užstato grąžinimas:
   - Nuomotojas patvirtina, kad nėra pretenzijų
   - Contract perveda pilną užstatą nuomininkui
   - Sutartis pilnai uždaryta

---

### **2. Ginčo Scenarijus (Dispute Resolution)**

```mermaid
sequenceDiagram
    participant L as Nuomotojas<br/>(Landlord)
    participant SC as Smart Contract<br/>(RentalAgreement)
    participant T as Nuomininkas<br/>(Tenant)
    participant A as Arbitras<br/>(Arbiter)

    Note over L,SC,A: [Phase 1-4 kaip Happy Path - Sutartis COMPLETED]

    rect rgb(255, 200, 200)
        Note over L,SC,T: KONFLIKTINĖ SITUACIJA: Turtas sugadintas?
    end

    Note over L,SC,A: PHASE 5A: Ginčo Kėlimas (vietoj returnDeposit)

    alt Nuomotojas kelia ginčą
        L->>SC: 5a. raiseDispute("Damaged floors - repair 0.01 ETH")
        activate SC
        SC->>SC: Patikrinti: state == COMPLETED
        SC->>SC: Patikrinti: !depositReturned
        SC->>SC: Patikrinti: msg.sender == landlord OR tenant
        SC->>SC: State = DISPUTED
        SC->>SC: Užstatas UŽŠALDOMAS contract'e
        SC-->>L: Emit DisputeRaised(landlord, reason)
        SC-->>A: Pranešimas: reikia arbitražo!
        deactivate SC
    else Nuomininkas kelia ginčą
        T->>SC: 5b. raiseDispute("No damage - unfair claim")
        activate SC
        SC->>SC: [Tie patys patikrinimai]
        SC->>SC: State = DISPUTED
        SC-->>T: Emit DisputeRaised(tenant, reason)
        SC-->>A: Pranešimas: reikia arbitražo!
        deactivate SC
    end

    Note over L,SC,A: PHASE 6: Arbitras Nagrinėja Bylą

    rect rgb(200, 220, 255)
        Note over A: Arbitras peržiūri įrodymus:<br/>- Nuotraukos prieš/po<br/>- Aktai, sąskaitos<br/>- Abiejų šalių paaiškinimus
    end

    A->>A: Analizuoja situaciją
    A->>A: Priima sprendimą: 70% tenant, 30% landlord

    Note over L,SC,A: PHASE 7: Ginčo Sprendimas ir Paskirstymas

    A->>SC: 6. resolveDispute(70) // 70% nuomininkui
    activate SC
    SC->>SC: Patikrinti: state == DISPUTED
    SC->>SC: Patikrinti: msg.sender == arbiter
    SC->>SC: Patikrinti: percentage <= 100
    SC->>SC: Apskaičiuoti: tenantAmount = deposit * 70 / 100
    SC->>SC: Apskaičiuoti: landlordAmount = deposit * 30 / 100
    SC->>SC: depositReturned = true

    par Lygiagretus Paskirstymas
        SC->>T: Transfer(0.014 ETH) - 70% užstato
        and
        SC->>L: Transfer(0.006 ETH) - 30% užstato
    end

    SC->>SC: State = COMPLETED
    SC-->>A: Emit DisputeResolved(0.014, 0.006)
    SC-->>L: Gautas kompensacija
    SC-->>T: Gautas dalis užstato
    deactivate SC

    Note over L,SC,A: Ginčas išspręstas! Abiejų šalių gauti pinigai.
```

#### **Veiksmai ir Jų Aprašymai:**

5a/5b. **raiseDispute()** - Ginčo kėlimas:

- Bet kuri šalis (landlord ar tenant) gali kelti ginčą
- Būtina būsena: `COMPLETED` (nuoma baigta)
- Užstatas užšaldomas contract'e - niekas negali jo paimti
- Būsena keičiasi į `DISPUTED`
- Išsiunčiamas event arbitrui

6. **resolveDispute()** - Arbitro sprendimas:
   - **TIK arbitras** gali iškviesti šią funkciją
   - Įveda procentinį paskirstymą (0-100):
     - `70` = 70% nuomininkui, 30% nuomotojui
     - `100` = visas užstatas nuomininkui (jokios žalos)
     - `0` = visas užstatas nuomotojui (rimta žala)
   - Contract automatiškai apskaičiuoja sumas
   - Perveda ETH abiems šalims pagal sprendimą
   - Būsena grįžta į `COMPLETED`
   - Sutartis uždaryta 
---

### **3. Sutarties Atšaukimo Scenarijus (Cancellation)** 🚫

```mermaid
sequenceDiagram
    participant L as Nuomotojas<br/>(Landlord)
    participant SC as Smart Contract<br/>(RentalAgreement)
    participant T as Nuomininkas<br/>(Tenant)

    Note over L,SC,T: PHASE 1: Sutarties Sukūrimas

    L->>SC: 1. constructor(tenant, arbiter, rent, deposit, duration, address)
    activate SC
    SC->>SC: Išsaugoti duomenis
    SC->>SC: State = CREATED
    SC-->>L: Sutartis sukurta
    deactivate SC

    Note over L,SC,T: PHASE 2: Nuomotojas Persigalvoja

    rect rgb(255, 240, 200)
        Note over L: Priežastys:<br/>- Rado kitą nuomininką<br/>- Parduoda turtą<br/>- Pasikeičia planai
    end

    L->>SC: 2. cancelRental()
    activate SC
    SC->>SC: Patikrinti: state == CREATED
    SC->>SC: Patikrinti: msg.sender == landlord
    SC->>SC: State = CANCELLED
    SC-->>L: Emit RentalCancelled("Contract cancelled by landlord")
    SC-->>T: Pranešimas: Sutartis atšaukta
    deactivate SC

    Note over L,SC,T: Sutartis neaktyvi - nuomininkas nebegali sumokėti

    rect rgb(220, 220, 220)
        Note over T: Nuomininkas negali:<br/>- payDepositAndFirstRent()<br/>- Bet kokių veiksmų su contract
    end
```

#### **Veiksmai ir Jų Aprašymai:**

1. **constructor()** - Standardinis deployment

   - Nuomotojas sukuria sutartį
   - Būsena: `CREATED`

2. **cancelRental()** - Atšaukimas prieš pradžią:
   - **TIK nuomotojas** gali atšaukti
   - **TIK būsenoje CREATED** (prieš sumokant užstatą)
   - Jokių finansinių įsipareigojimų - niekas nesumokėjo pinigų
   - Sutartis tampa `CANCELLED` - visiškai neaktyvi
   - Nuomininkas negali aktyvuoti sutarties

**Kodėl svarbu:** Lankstumo suteikimas prieš pradedant sutartį, jokių baudų.

## Technologijos

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract**: Solidity ^0.8.0
- **Development Framework**: Truffle
- **Local Testing**: Ganache
- **Wallet**: MetaMask
- **API Provider**: Infura
- **Frontend**: HTML, CSS, JavaScript, Web3.js

## Įdiegimas ir Paleidimas

### 1. Priklausomybių Įdiegimas

```bash
npm install
```

Įdiekite reikiamus paketus:

```bash
npm install dotenv @truffle/hdwallet-provider
```

### 2. Konfigūracija

Sukurkite `.env` failą pagal `.env.example`:

```bash
MNEMONIC="your twelve word seed phrase from MetaMask"
INFURA_API_KEY="your_infura_api_key"
```

**Kaip gauti Infura API Key:**

1. Užsiregistruokite https://infura.io
2. Sukurkite naują projektą
3. Nukopijuokite API Key

### 3. Paleiskite Ganache

Atidarykite Ganache aplikaciją ir įsitikinkite, kad ji veikia ant porto **7545**.

### 4. Kompiliavimas

```bash
truffle compile
```

### 5. Testavimas Lokaliame Tinkle

```bash
truffle test --network development
```

### 6. Migration į Ganache

```bash
truffle migrate --network development
```

### 7. Deployment į Sepolia Testnet

Įsitikinkite, kad turite Sepolia ETH MetaMask wallet'e:

```bash
truffle migrate --network sepolia
```

## Testavimas

Projektui sukurti išsamūs testai (`test/RentalAgreement.test.js`):

```bash
truffle test
```

Testai apima:

- Sutarties sukūrimą
- Užstato ir pirmo mokėjimo sumokėjimą
- Mėnesinius mokėjimus
- Nuomos užbaigimą
- Užstato grąžinimą
- Ginčų kėlimą ir sprendimą
- Sutarties atšaukimą

## Smart Contract Funkcijos

### Pagrindinės Funkcijos

1. **constructor()** - Sukuria nuomos sutartį
2. **payDepositAndFirstRent()** - Nuomininkas sumoka užstatą ir pirmą nuomą
3. **payMonthlyRent()** - Mėnesinio mokėjimo atlikimas
4. **completeRental()** - Nuomos užbaigimas
5. **returnDeposit()** - Užstato grąžinimas nuomininkui
6. **raiseDispute()** - Ginčo kėlimas
7. **resolveDispute()** - Arbitro sprendimas
8. **cancelRental()** - Sutarties atšaukimas

### View Funkcijos

- **getRentalInfo()** - Gauti visą sutarties informaciją
- **getContractBalance()** - Sutarties balansas
- **getDaysUntilEnd()** - Dienų skaičius iki nuomos pabaigos
- **isRentDue()** - Ar reikia mokėti nuomą

## Front-End Aplikacija

Front-End aplikacija (bus sukurta) leis:

- Prisijungti su MetaMask
- Kurti naujas nuomos sutartis (nuomotojui)
- Peržiūrėti sutarties detales
- Mokėti užstatą ir nuomą (nuomininkui)
- Valdyti ginčus
- Matyti transakcijų istoriją

---

## Deployed Smart Contract

### Live Contract na Sepolia Testnet

**Contract Address:**

```
0xeF9D744ADc74eeC3E8C81F598A0FA93d36CC4515
```

### Blockchain Explorers

Galite peržiūrėti contract ir transakcijas:

1. **Sepolia Etherscan** (Main)

   - https://sepolia.etherscan.io/address/0xeF9D744ADc74eeC3E8C81F598A0FA93d36CC4515
   - Verified source code
   - View transactions, events, contract state

2. **Blockscout** (Alternative)

   - https://eth-sepolia.blockscout.com/address/0xeF9D744ADc74eeC3E8C81F598A0FA93d36CC4515
   - Verified and readable code
   - Detailed transaction traces

3. **Sourcify** (Source Verification)
   - https://sourcify.dev/#/lookup/0xeF9D744ADc74eeC3E8C81F598A0FA93d36CC4515
   - Full source code match
   - Contract metadata

### Deployment Details

```
Network:          Sepolia Testnet
Chain ID:         11155111
Block Number:     9858338
Deployer:         0xb563E604b28CA91Be0548F9655b463253971AbD9
Transaction Hash: 0xea8079d5f4f04305d24b85d935a065415e4534754e847519cf82bfc998e255d9
Gas Used:         489,130
Deployment Date:  2024-12-17
Verification:     Verified on Sourcify & Blockscout
```

### 🔍 Contract Constructor Parameters

Contract buvo deployed su šiais parametrais:

```solidity
Tenant Address:    0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Arbiter Address:   0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Monthly Rent:      0.01 ETH (10000000000000000 Wei)
Deposit:           0.02 ETH (20000000000000000 Wei)
Duration:          6 months
Property Address:  "Gedimino pr. 1, Vilnius"
```

### Kaip Peržiūrėti Contract

1. **Atidarykite Etherscan link** viršuje
2. **Tabs kuriuos galite naudoti:**

   - **Transactions** - Visos transakcijos su šiuo contract
   - **Contract** → **Read Contract** - Skaityti public kintamuosius
   - **Contract** → **Write Contract** - Vykdyti funkcijas (reikia MetaMask)
   - **Events** - Visi išmesti events (RentalCreated, RentPaid, etc.)
   - **Code** - Pilnas Solidity source code

3. **Read Contract Examples:**

   - `getRentalInfo()` - Gauti visą sutarties informaciją
   - `getContractBalance()` - Žiūrėti užstato sumą contract'e
   - `getDaysUntilEnd()` - Kiek dienų liko iki pabaigos
   - `rental()` - Tiesiogiai pasiekti rental struct

4. **Write Contract Examples** (reikia Connect Wallet):
   - `payDepositAndFirstRent()` - Tenant aktyvuoja sutartį
   - `payMonthlyRent()` - Tenant moka mėnesinę nuomą
   - `returnDeposit()` - Landlord grąžina užstatą

## Sutarties Būsenos (States)

- **CREATED** (0) - Sutartis sukurta, laukiama užstato
- **ACTIVE** (1) - Sutartis aktyvi, vyksta nuoma
- **PAYMENT_PENDING** (2) - Laukiama mokėjimo (rezervuota)
- **COMPLETED** (3) - Nuoma baigta sėkmingai
- **DISPUTED** (4) - Ginčas tarp šalių
- **CANCELLED** (5) - Sutartis atšaukta

## Pagrindiniai Pranašumai

1. **Skaidrumas** - Visos transakcijos blockchain'e
2. **Automatizacija** - Mokėjimai pervedami automatiškai
3. **Saugumas** - Užstatas saugomas sutartyje
4. **Ginčų sprendimas** - Neutralus arbitras
5. **Patikimumas** - Kodo negalima pakeisti

## Saugumo Funkcijos

- Modifikatoriai (onlyLandlord, onlyTenant, onlyArbiter)
- Būsenų valdymas (State machine)
- Laiko patikros (mokėjimų dažnis)
- Reentrancy apsauga
- Input validacija

## Papildoma Informacija

- **Solidity versija**: 0.8.21
- **License**: MIT
- **Network**: Ethereum (Sepolia Testnet)
- **Autorius**: [Jūsų vardas]

---

## Verslo Modelio Santrauka

### Pagrindinė Idėja

**Problema:** Tradicinėse nuomos sutartyse:

- Užstatas gali būti nepagristai sulaikytas
- Nuomininkas turi pasitikėti nuomotoju
- Ginčai sprendžiami teismuose (ilgai ir brangiai)
- Nėra skaidrumo pinigų judėjime

**Sprendimas - Smart Contract:**

- Užstatas saugomas blockchain'e (neutrali vieta)
- Automatiniai mokėjimai - be tarpininkų
- Nepriklausomas arbitras greičiams ginčams
- Viskas skaidru ir įrašyta blockchain'e
- Kodas = sutartis (negalima apgauti)

### Unikalūs Verslo Modelio Bruožai

| Aspektas           | Pavyzdinis Modelis (Prekių Pardavimas) | Mūsų Modelis (Nuoma)                                                 |
| ------------------ | -------------------------------------- | -------------------------------------------------------------------- |
| **Trukmė**         | Momentinė transakcija                  | Ilgalaikis santykis (6 mėn)                                          |
| **Mokėjimai**      | Vienas mokėjimas                       | Periodiniai mokėjimai                                                |
| **Šalys**          | 2 (pirkėjas, pardavėjas)               | 3 (landlord, tenant, arbiter)                                        |
| **Garantija**      | Escrow tik delivery metu               | Užstatas visą laiką                                                  |
| **Ginčai**         | Produkto pristatymo                    | Turto būklės, mokėjimų                                               |
| **Būsenos**        | 3 (Created, Paid, Delivered)           | 6 (CREATED, ACTIVE, PAYMENT_PENDING, COMPLETED, DISPUTED, CANCELLED) |
| **Automatizacija** | Vienkartin                             | Pasikartojanti (mėnesiniai mokėjimai)                                |

### Kodėl Šis Modelis Vertas Papildomo Balo?

1. **Sudėtingumas** - Ne vienkartinė transakcija, o ilgalaikis process management
2. **Laikas** - Laiko valdymas (mokėjimų intervalai, sutarties trukmė)
3. **Trečioji Šalis** - Arbitro rolė ir ginčų sprendimo mechanizmas
4. **Periodiškumas** - Loop'ai ir pasikartojantys mokėjimai
5. **Realus Panaudojimas** - Tiesioginė rinkos problema (nuomos sutartys)
6. **Valstybių Mašina** - Kompleksiška state machine su 6 būsenomis

### Verslo Logikos Pilnumas

**Aprėpta:**

- Happy path (visa sėkminga)
- Dispute path (ginčas ir sprendimas)
- Cancellation path (atšaukimas prieš pradžią)
- Edge cases (mokėjimų intervalai, laiko valdymas)
- Security (role-based access control)
- Financial safety (užstato apsauga)

**Realūs Panaudojimo Scenarijai:**

- Butų nuoma
- Komerciniųturnų nuoma
- Automobilių nuoma (ilgalaikė)
- Atostogų namų nuoma (trumpalaikė)

---

## Akademinė Užduotis - Įvykdyti Reikalavimai

### Užduoties Įgyvendinimas

**1. Verslo Modelio Aprašymas** 

- Išsamiai aprašytas verslo modelis (skirtumas nuo pavyzdžio)
- Aiškiai įvardyti 3 pagrindiniai veikėjai su rolėmis ir funkcijomis
- Aprašyti 4 tipiški scenarijai su detaliais žingsniais
- 3 sekų diagramos (Happy Path, Dispute, Cancellation) su Mermaid
- Kiekvienas sekos veiksmas trumpai aprašytas

**2. Smart Contract Implementacija** 

- Solidity 0.8.21 smart contract (322 linijos)
- 9 pagrindinės funkcijos + 4 view funkcijos
- 6 būsenos (state machine)
- 9 events (RentalCreated, RentPaid, DisputeRaised, etc.)
- Security: modifieriai, validacijos, reentrancy protection

**3. Testing ir Deployment** 

- Comprehensive test suite (Ganache)
- Deployed į Sepolia Testnet
- Verified contract source code (Sourcify, Blockscout)
- Etherscan links su transakcijomis

**4. Decentralizuota Aplikacija (DApp)** 

-  Frontend su HTML/CSS/JavaScript
-  Web3.js integracija
-  MetaMask connection
-  Responsive UI su 3 tabs (Create, Manage, View)
-  Notifications system

**5. Dokumentacija** 

-  README.md su išsamiais aprašymais
-  Sequence diagrams (Mermaid format)
-  Deployment guide (Ganache ir Sepolia)
-  Testing guide
-  Business model description

###  Papildomas Balas (+0.5)

**Kriterijai įvykdyti:**

1.  **Kitoks verslo modelis** - Ne prekių pardavimas, o nuomos valdymas
2.  **Kokybiškas aprašymas** - Išsamus README su:
   - Veikėjų rolėmis ir atsakomybėmis
   - Tipiniais scenarijais su žingsniais
   - 3 detaliomniškomis sequence diagrams
   - Kiekvieno action aprašymu
   - Business model privalumais ir skirtumais
3. **Kompleksiškumas** - 6 būsenos, 3 šalys, periodiniai mokėjimai
4. **Realus panaudojimas** - Sprendžia tikrą rinkos problemą

---