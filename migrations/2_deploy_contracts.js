const RentalAgreement = artifacts.require("RentalAgreement");

module.exports = function(deployer, network, accounts) {
  // Pavyzdiniai duomenys deployment'ui
  const landlord = accounts[0];  // Nuomotojas
  const tenant = accounts[1];    // Nuomininkas
  const arbiter = accounts[2];   // Arbitras
  
  // 0.1 ETH mėnesinė nuoma
  const monthlyRent = web3.utils.toWei('0.1', 'ether');
  
  // 0.3 ETH užstatas
  const deposit = web3.utils.toWei('0.3', 'ether');
  
  // 6 mėnesių nuoma
  const durationMonths = 6;
  
  // Turto adresas
  const propertyAddress = "Gedimino pr. 1, Vilnius, Lietuva";
  
  deployer.deploy(
    RentalAgreement,
    tenant,
    arbiter,
    monthlyRent,
    deposit,
    durationMonths,
    propertyAddress,
    { from: landlord }
  );
};
