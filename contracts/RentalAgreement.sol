// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RentalAgreement
 * @dev Išmanioji sutartis nekilnojamojo turto nuomos valdymui
 * Dalyvauja: Nuomotojas (Landlord), Nuomininkas (Tenant), Arbitras (Arbiter)
 */
contract RentalAgreement {
    // Nuomos būsenos
    enum State {
        CREATED, // Sutartis sukurta
        ACTIVE, // Sutartis aktyvi (apmokėta)
        PAYMENT_PENDING, // Laukiama mokėjimo
        COMPLETED, // Nuoma baigta sėkmingai
        DISPUTED, // Ginčas
        CANCELLED // Atšaukta
    }

    // Sutarties duomenys
    struct Rental {
        address payable landlord; // Nuomotojo adresas
        address payable tenant; // Nuomininko adresas
        address arbiter; // Arbitro adresas
        uint256 monthlyRent; // Mėnesio nuomos kaina (Wei)
        uint256 deposit; // Užstatas (Wei)
        uint256 startDate; // Pradžios data (timestamp)
        uint256 endDate; // Pabaigos data (timestamp)
        uint256 lastPaymentDate; // Paskutinio mokėjimo data
        State state; // Dabartinė būsena
        bool depositReturned; // Ar užstatas grąžintas
        string propertyAddress; // Nuomojamo turto adresas
    }

    Rental public rental;

    // Įvykiai (Events)
    event RentalCreated(
        address landlord,
        address tenant,
        uint256 monthlyRent,
        uint256 deposit
    );
    event DepositPaid(address tenant, uint256 amount);
    event RentPaid(address tenant, uint256 amount, uint256 date);
    event RentalActivated(uint256 startDate);
    event RentalCompleted(uint256 endDate);
    event DepositReturned(address tenant, uint256 amount);
    event DisputeRaised(address by, string reason);
    event DisputeResolved(uint256 tenantAmount, uint256 landlordAmount);
    event RentalCancelled(string reason);

    // Modifikatoriai
    modifier onlyLandlord() {
        require(
            msg.sender == rental.landlord,
            "Only landlord can perform this action"
        );
        _;
    }

    modifier onlyTenant() {
        require(
            msg.sender == rental.tenant,
            "Only tenant can perform this action"
        );
        _;
    }

    modifier onlyArbiter() {
        require(
            msg.sender == rental.arbiter,
            "Only arbiter can perform this action"
        );
        _;
    }

    modifier inState(State _state) {
        require(rental.state == _state, "Invalid contract state");
        _;
    }

    /**
     * @dev Konstruktorius - nuomotojas sukuria sutartį
     * @param _tenant Nuomininko adresas
     * @param _arbiter Arbitro adresas
     * @param _monthlyRent Mėnesio nuomos kaina Wei
     * @param _deposit Užstato suma Wei
     * @param _durationMonths Nuomos trukmė mėnesiais
     * @param _propertyAddress Turto adresas
     */
    constructor(
        address payable _tenant,
        address _arbiter,
        uint256 _monthlyRent,
        uint256 _deposit,
        uint256 _durationMonths,
        string memory _propertyAddress
    ) {
        require(_tenant != address(0), "Invalid tenant address");
        require(_arbiter != address(0), "Invalid arbiter address");
        require(_monthlyRent > 0, "Monthly rent must be greater than 0");
        require(_deposit > 0, "Deposit must be greater than 0");
        require(_durationMonths > 0, "Duration must be greater than 0");

        rental.landlord = payable(msg.sender);
        rental.tenant = _tenant;
        rental.arbiter = _arbiter;
        rental.monthlyRent = _monthlyRent;
        rental.deposit = _deposit;
        rental.endDate = block.timestamp + (_durationMonths * 30 days);
        rental.state = State.CREATED;
        rental.propertyAddress = _propertyAddress;
        rental.depositReturned = false;

        emit RentalCreated(msg.sender, _tenant, _monthlyRent, _deposit);
    }

    /**
     * @dev Nuomininkas sumoka užstatą ir pirmą nuomos mokestį
     */
    function payDepositAndFirstRent()
        external
        payable
        onlyTenant
        inState(State.CREATED)
    {
        uint256 requiredAmount = rental.deposit + rental.monthlyRent;
        require(
            msg.value == requiredAmount,
            "Invalid amount. Must pay deposit + first rent"
        );

        rental.state = State.ACTIVE;
        rental.startDate = block.timestamp;
        rental.lastPaymentDate = block.timestamp;

        // Pervesti pirmą nuomos mokestį nuomotojui
        rental.landlord.transfer(rental.monthlyRent);

        emit DepositPaid(msg.sender, rental.deposit);
        emit RentPaid(msg.sender, rental.monthlyRent, block.timestamp);
        emit RentalActivated(block.timestamp);
    }

    /**
     * @dev Nuomininkas moka mėnesinę nuomą
     */
    function payMonthlyRent()
        external
        payable
        onlyTenant
        inState(State.ACTIVE)
    {
        require(block.timestamp < rental.endDate, "Rental period has ended");
        require(msg.value == rental.monthlyRent, "Invalid rent amount");

        // Check if at least 25 days have passed since last payment
        require(
            block.timestamp >= rental.lastPaymentDate + 25 days,
            "Too early to pay next month rent"
        );

        rental.lastPaymentDate = block.timestamp;
        rental.landlord.transfer(rental.monthlyRent);

        emit RentPaid(msg.sender, rental.monthlyRent, block.timestamp);
    }

    /**
     * @dev Baigti nuomą (gali iškviesti nuomotojas arba nuomininkas)
     */
    function completeRental() external inState(State.ACTIVE) {
        require(
            msg.sender == rental.landlord || msg.sender == rental.tenant,
            "Only landlord or tenant can complete rental"
        );
        require(
            block.timestamp >= rental.endDate,
            "Rental period not yet ended"
        );

        rental.state = State.COMPLETED;

        emit RentalCompleted(block.timestamp);
    }

    /**
     * @dev Grąžinti užstatą nuomininkui (kviečia nuomotojas, jei nėra pretenzijų)
     */
    function returnDeposit() external onlyLandlord inState(State.COMPLETED) {
        require(!rental.depositReturned, "Deposit already returned");

        rental.depositReturned = true;
        rental.tenant.transfer(rental.deposit);

        emit DepositReturned(rental.tenant, rental.deposit);
    }

    /**
     * @dev Pradėti ginčą (gali nuomotojas arba nuomininkas)
     * @param _reason Ginčo priežastis
     */
    function raiseDispute(string memory _reason) external {
        require(
            rental.state == State.ACTIVE || rental.state == State.COMPLETED,
            "Can only raise dispute when active or completed"
        );
        require(
            msg.sender == rental.landlord || msg.sender == rental.tenant,
            "Only landlord or tenant can raise dispute"
        );
        require(!rental.depositReturned, "Deposit already returned");

        rental.state = State.DISPUTED;

        emit DisputeRaised(msg.sender, _reason);
    }

    /**
     * @dev Arbitras išsprendžia ginčą ir paskirsto užstatą
     * @param _tenantPercentage Kiek procentų užstato grąžinti nuomininkui (0-100)
     */
    function resolveDispute(
        uint256 _tenantPercentage
    ) external onlyArbiter inState(State.DISPUTED) {
        require(
            _tenantPercentage <= 100,
            "Percentage must be between 0 and 100"
        );
        require(!rental.depositReturned, "Deposit already returned");

        uint256 tenantAmount = (rental.deposit * _tenantPercentage) / 100;
        uint256 landlordAmount = rental.deposit - tenantAmount;

        rental.depositReturned = true;

        if (tenantAmount > 0) {
            rental.tenant.transfer(tenantAmount);
        }
        if (landlordAmount > 0) {
            rental.landlord.transfer(landlordAmount);
        }

        rental.state = State.COMPLETED;

        emit DisputeResolved(tenantAmount, landlordAmount);
    }

    /**
     * @dev Atšaukti sutartį prieš pradedant (tik jei dar nesumokėtas užstatas)
     */
    function cancelRental() external onlyLandlord inState(State.CREATED) {
        rental.state = State.CANCELLED;

        emit RentalCancelled("Contract cancelled by landlord");
    }

    /**
     * @dev Gauti sutarties informaciją
     */
    function getRentalInfo()
        external
        view
        returns (
            address landlord,
            address tenant,
            address arbiter,
            uint256 monthlyRent,
            uint256 deposit,
            uint256 startDate,
            uint256 endDate,
            uint256 lastPaymentDate,
            State state,
            bool depositReturned,
            string memory propertyAddress
        )
    {
        return (
            rental.landlord,
            rental.tenant,
            rental.arbiter,
            rental.monthlyRent,
            rental.deposit,
            rental.startDate,
            rental.endDate,
            rental.lastPaymentDate,
            rental.state,
            rental.depositReturned,
            rental.propertyAddress
        );
    }

    /**
     * @dev Gauti sutarties balansą (užstato suma)
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Apskaičiuoti kiek dienų liko iki nuomos pabaigos
     */
    function getDaysUntilEnd() external view returns (uint256) {
        if (block.timestamp >= rental.endDate) {
            return 0;
        }
        return (rental.endDate - block.timestamp) / 1 days;
    }

    /**
     * @dev Patikrinti ar reikia mokėti nuomą
     */
    function isRentDue() external view returns (bool) {
        if (rental.state != State.ACTIVE) {
            return false;
        }
        if (block.timestamp >= rental.endDate) {
            return false;
        }
        return block.timestamp >= rental.lastPaymentDate + 25 days;
    }
}
