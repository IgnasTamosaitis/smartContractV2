const RentalAgreement = artifacts.require("RentalAgreement");

contract("RentalAgreement", (accounts) => {
  const landlord = accounts[0];
  const tenant = accounts[1];
  const arbiter = accounts[2];
  
  const monthlyRent = web3.utils.toWei('0.1', 'ether');
  const deposit = web3.utils.toWei('0.3', 'ether');
  const durationMonths = 6;
  const propertyAddress = "Gedimino pr. 1, Vilnius, Lietuva";
  
  let rentalInstance;
  
  beforeEach(async () => {
    rentalInstance = await RentalAgreement.new(
      tenant,
      arbiter,
      monthlyRent,
      deposit,
      durationMonths,
      propertyAddress,
      { from: landlord }
    );
  });
  
  describe("Sutarties sukūrimas", () => {
    it("turėtų sukurti sutartį su teisingais parametrais", async () => {
      const info = await rentalInstance.getRentalInfo();
      
      assert.equal(info.landlord, landlord, "Neteisingas nuomotojo adresas");
      assert.equal(info.tenant, tenant, "Neteisingas nuomininko adresas");
      assert.equal(info.arbiter, arbiter, "Neteisingas arbitro adresas");
      assert.equal(info.monthlyRent.toString(), monthlyRent, "Neteisinga nuomos kaina");
      assert.equal(info.deposit.toString(), deposit, "Neteisingas užstatas");
      assert.equal(info.state.toString(), '0', "Būsena turėtų būti CREATED");
    });
  });
  
  describe("Užstato ir pirmo mokėjimo sumokėjimas", () => {
    it("nuomininkas turėtų mokėti užstatą ir pirmą nuomą", async () => {
      const totalAmount = web3.utils.toBN(deposit).add(web3.utils.toBN(monthlyRent));
      
      await rentalInstance.payDepositAndFirstRent({ 
        from: tenant, 
        value: totalAmount 
      });
      
      const info = await rentalInstance.getRentalInfo();
      assert.equal(info.state.toString(), '1', "Būsena turėtų būti ACTIVE");
      
      const balance = await rentalInstance.getContractBalance();
      assert.equal(balance.toString(), deposit, "Sutartyje turėtų likti tik užstatas");
    });
    
    it("neturėtų leisti sumokėti neteisingos sumos", async () => {
      try {
        await rentalInstance.payDepositAndFirstRent({ 
          from: tenant, 
          value: deposit 
        });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Invalid amount"), "Wrong error message");
      }
    });
    
    it("neturėtų leisti ne nuomininkui mokėti", async () => {
      const totalAmount = web3.utils.toBN(deposit).add(web3.utils.toBN(monthlyRent));
      
      try {
        await rentalInstance.payDepositAndFirstRent({ 
          from: landlord, 
          value: totalAmount 
        });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Only tenant"), "Wrong error message");
      }
    });
  });
  
  describe("Mėnesinės nuomos mokėjimas", () => {
    beforeEach(async () => {
      const totalAmount = web3.utils.toBN(deposit).add(web3.utils.toBN(monthlyRent));
      await rentalInstance.payDepositAndFirstRent({ 
        from: tenant, 
        value: totalAmount 
      });
    });
    
    it("neturėtų leisti mokėti per anksti", async () => {
      try {
        await rentalInstance.payMonthlyRent({ 
          from: tenant, 
          value: monthlyRent 
        });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Too early"), "Wrong error message");
      }
    });
  });
  
  describe("Nuomos užbaigimas ir užstato grąžinimas", () => {
    beforeEach(async () => {
      const totalAmount = web3.utils.toBN(deposit).add(web3.utils.toBN(monthlyRent));
      await rentalInstance.payDepositAndFirstRent({ 
        from: tenant, 
        value: totalAmount 
      });
    });
    
    it("nuomotojas turėtų grąžinti užstatą po sėkmingos nuomos", async () => {
      // Simuliuojame laiko praėjimą (Ganache funkcija)
      await new Promise((resolve) => {
        web3.currentProvider.send({
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [durationMonths * 30 * 24 * 60 * 60], // 6 mėnesiai sekundėmis
          id: new Date().getTime()
        }, () => {
          web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
          }, resolve);
        });
      });
      
      await rentalInstance.completeRental({ from: landlord });
      
      const tenantBalanceBefore = await web3.eth.getBalance(tenant);
      
      await rentalInstance.returnDeposit({ from: landlord });
      
      const tenantBalanceAfter = await web3.eth.getBalance(tenant);
      const difference = web3.utils.toBN(tenantBalanceAfter).sub(web3.utils.toBN(tenantBalanceBefore));
      
      assert.equal(difference.toString(), deposit, "Užstatas turėjo būti grąžintas");
      
      const info = await rentalInstance.getRentalInfo();
      assert.equal(info.depositReturned, true, "depositReturned turėtų būti true");
    });
  });
  
  describe("Ginčų sprendimas", () => {
    beforeEach(async () => {
      const totalAmount = web3.utils.toBN(deposit).add(web3.utils.toBN(monthlyRent));
      await rentalInstance.payDepositAndFirstRent({ 
        from: tenant, 
        value: totalAmount 
      });
      
      // Simuliuojame laiko praėjimą
      await new Promise((resolve) => {
        web3.currentProvider.send({
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [durationMonths * 30 * 24 * 60 * 60],
          id: new Date().getTime()
        }, () => {
          web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
          }, resolve);
        });
      });
      
      await rentalInstance.completeRental({ from: landlord });
    });
    
    it("nuomotojas gali kelti ginčą", async () => {
      await rentalInstance.raiseDispute("Sugadintas turtas", { from: landlord });
      
      const info = await rentalInstance.getRentalInfo();
      assert.equal(info.state.toString(), '3', "Būsena turėtų būti DISPUTED");
    });
    
    it("arbitras gali išspręsti ginčą", async () => {
      await rentalInstance.raiseDispute("Sugadintas turtas", { from: landlord });
      
      // Arbitras nusprendžia grąžinti 70% nuomininkui, 30% nuomotojui
      await rentalInstance.resolveDispute(70, { from: arbiter });
      
      const info = await rentalInstance.getRentalInfo();
      assert.equal(info.depositReturned, true, "Užstatas turėjo būti paskirstytas");
      assert.equal(info.state.toString(), '2', "Būsena turėtų būti COMPLETED");
    });
    
    it("tik arbitras gali spręsti ginčą", async () => {
      await rentalInstance.raiseDispute("Sugadintas turtas", { from: landlord });
      
      try {
        await rentalInstance.resolveDispute(70, { from: tenant });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Only arbiter"), "Wrong error message");
      }
    });
  });
  
  describe("Sutarties atšaukimas", () => {
    it("nuomotojas gali atšaukti sutartį prieš pradedant", async () => {
      await rentalInstance.cancelRental({ from: landlord });
      
      const info = await rentalInstance.getRentalInfo();
      assert.equal(info.state.toString(), '5', "Būsena turėtų būti CANCELLED");
    });
    
    it("negalima atšaukti po užstato sumokėjimo", async () => {
      const totalAmount = web3.utils.toBN(deposit).add(web3.utils.toBN(monthlyRent));
      await rentalInstance.payDepositAndFirstRent({ 
        from: tenant, 
        value: totalAmount 
      });
      
      try {
        await rentalInstance.cancelRental({ from: landlord });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Invalid contract state"), "Wrong error message");
      }
    });
  });
});
