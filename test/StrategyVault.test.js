const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('StrategyVault', function () {
  let vault;
  let usdc;
  let owner;
  let strategy;
  let alice;
  let bob;

  const USDC_DECIMALS = 6n;
  const ONE_USDC = 10n ** USDC_DECIMALS;
  const DEPOSIT_AMOUNT = 1000n * ONE_USDC; // 1000 USDC

  beforeEach(async function () {
    [owner, strategy, alice, bob] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory('MockUSDC');
    usdc = await MockUSDCFactory.deploy();

    const VaultFactory = await ethers.getContractFactory('StrategyVault');
    vault = await VaultFactory.deploy(
      await usdc.getAddress(),
      'CardFi Yield Vault',
      'CFYV',
      strategy.address
    );

    // Disable management fee to avoid time-based share dilution during exact-amount tests
    await vault.connect(owner).setFees(1000n, 0n);

    await usdc.mint(alice.address, DEPOSIT_AMOUNT * 10n);
    await usdc.mint(bob.address, DEPOSIT_AMOUNT * 10n);
    await usdc.mint(strategy.address, DEPOSIT_AMOUNT * 10n);
  });

  // ----- Deposit -----
  describe('deposit()', function () {
    it('mints shares 1:1 on first deposit', async function () {
      await usdc.connect(alice).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
      await vault.connect(alice).deposit(DEPOSIT_AMOUNT, alice.address);
      expect(await vault.balanceOf(alice.address)).to.equal(DEPOSIT_AMOUNT);
      expect(await vault.totalAssets()).to.equal(DEPOSIT_AMOUNT);
    });

    it('reverts when depositing 0', async function () {
      await expect(vault.connect(alice).deposit(0n, alice.address))
        .to.be.revertedWith('Cannot deposit 0 assets');
    });

    it('reverts with insufficient allowance', async function () {
      await expect(vault.connect(alice).deposit(DEPOSIT_AMOUNT, alice.address))
        .to.be.reverted;
    });

    it('second depositor gets fewer shares after harvest', async function () {
      await usdc.connect(alice).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
      await vault.connect(alice).deposit(DEPOSIT_AMOUNT, alice.address);

      const profit = 100n * ONE_USDC;
      await usdc.connect(strategy).transfer(await vault.getAddress(), profit);
      await vault.connect(strategy).harvest(profit);

      await usdc.connect(bob).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
      await vault.connect(bob).deposit(DEPOSIT_AMOUNT, bob.address);

      expect(await vault.balanceOf(bob.address))
        .to.be.lessThan(await vault.balanceOf(alice.address));
    });
  });

  // ----- Withdraw & Redeem -----
  describe('withdraw() and redeem()', function () {
    beforeEach(async function () {
      await usdc.connect(alice).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
      await vault.connect(alice).deposit(DEPOSIT_AMOUNT, alice.address);
    });

    it('withdraw() returns correct USDC and burns all shares', async function () {
      const usdcBefore = await usdc.balanceOf(alice.address);
      await vault.connect(alice).withdraw(DEPOSIT_AMOUNT, alice.address, alice.address);
      expect(await vault.balanceOf(alice.address)).to.equal(0n);
      expect(await usdc.balanceOf(alice.address) - usdcBefore).to.equal(DEPOSIT_AMOUNT);
    });

    it('redeem() returns correct USDC and burns all shares', async function () {
      const shares = await vault.balanceOf(alice.address);
      const usdcBefore = await usdc.balanceOf(alice.address);
      await vault.connect(alice).redeem(shares, alice.address, alice.address);
      expect(await usdc.balanceOf(alice.address) - usdcBefore).to.equal(DEPOSIT_AMOUNT);
    });

    it('withdraw() reverts when exceeding balance', async function () {
      await expect(vault.connect(alice).withdraw(DEPOSIT_AMOUNT * 2n, alice.address, alice.address))
        .to.be.revertedWith('Insufficient assets');
    });

    it('withdraw() reverts with 0', async function () {
      await expect(vault.connect(alice).withdraw(0n, alice.address, alice.address))
        .to.be.revertedWith('Cannot withdraw 0 assets');
    });
  });

  // ----- harvest() BUG-FIX -----
  describe('harvest()', function () {
    beforeEach(async function () {
      await usdc.connect(alice).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
      await vault.connect(alice).deposit(DEPOSIT_AMOUNT, alice.address);
    });

    it('BUG-FIX: increases totalAssets by profit minus 10% performance fee', async function () {
      const profit = 100n * ONE_USDC;
      const expectedFee = (profit * 1000n) / 10000n;
      const expectedNet = profit - expectedFee;

      await usdc.connect(strategy).transfer(await vault.getAddress(), profit);
      const totalBefore = await vault.totalAssets();
      await vault.connect(strategy).harvest(profit);
      expect(await vault.totalAssets() - totalBefore).to.equal(expectedNet);
    });

    it('pays performance fee to owner', async function () {
      const profit = 100n * ONE_USDC;
      const expectedFee = (profit * 1000n) / 10000n;
      await usdc.connect(strategy).transfer(await vault.getAddress(), profit);
      const ownerBefore = await usdc.balanceOf(owner.address);
      await vault.connect(strategy).harvest(profit);
      expect(await usdc.balanceOf(owner.address) - ownerBefore).to.equal(expectedFee);
    });

    it('reverts if reported profit exceeds actual vault balance', async function () {
      await usdc.connect(strategy).transfer(await vault.getAddress(), 50n * ONE_USDC);
      await expect(vault.connect(strategy).harvest(100n * ONE_USDC))
        .to.be.revertedWith('Reported profit not in vault');
    });

    it('reverts with 0 profit', async function () {
      await expect(vault.connect(strategy).harvest(0n))
        .to.be.revertedWith('No profit to harvest');
    });

    it('reverts when non-strategy calls harvest()', async function () {
      await expect(vault.connect(alice).harvest(100n * ONE_USDC))
        .to.be.revertedWith('Only strategy can call');
    });
  });

  // ----- APY BUG-FIX -----
  describe('reportAPY() / getCurrentAPY()', function () {
    it('BUG-FIX: returns 0 before any report (was hardcoded 1200)', async function () {
      expect(await vault.getCurrentAPY()).to.equal(0n);
    });

    it('reflects strategy-reported APY', async function () {
      await vault.connect(strategy).reportAPY(850n);
      expect(await vault.getCurrentAPY()).to.equal(850n);
    });

    it('reverts when non-strategy calls reportAPY()', async function () {
      await expect(vault.connect(alice).reportAPY(850n))
        .to.be.revertedWith('Only strategy can call');
    });

    it('APY visible in getVaultInfo()', async function () {
      await vault.connect(strategy).reportAPY(1200n);
      const info = await vault.getVaultInfo();
      expect(info[3]).to.equal(1200n);
    });
  });

  // ----- Emergency withdraw timelock BUG-FIX -----
  describe('emergencyWithdraw() 2-day timelock', function () {
    beforeEach(async function () {
      await usdc.connect(alice).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
      await vault.connect(alice).deposit(DEPOSIT_AMOUNT, alice.address);
    });

    it('BUG-FIX: reverts without prior initiateEmergencyWithdraw()', async function () {
      await expect(vault.connect(owner).emergencyWithdraw())
        .to.be.revertedWith('Must initiate first');
    });

    it('reverts before 2-day timelock elapses', async function () {
      await vault.connect(owner).initiateEmergencyWithdraw();
      await time.increase(86400); // 1 day only
      await expect(vault.connect(owner).emergencyWithdraw())
        .to.be.revertedWith('Timelock not elapsed');
    });

    it('succeeds after 2-day timelock and drains vault', async function () {
      await vault.connect(owner).initiateEmergencyWithdraw();
      await time.increase(2 * 86400 + 1);
      const ownerBefore = await usdc.balanceOf(owner.address);
      await vault.connect(owner).emergencyWithdraw();
      expect(await usdc.balanceOf(owner.address) - ownerBefore).to.equal(DEPOSIT_AMOUNT);
      expect(await vault.totalAssets()).to.equal(0n);
    });

    it('cancel prevents execution even after timelock', async function () {
      await vault.connect(owner).initiateEmergencyWithdraw();
      await vault.connect(owner).cancelEmergencyWithdraw();
      await time.increase(2 * 86400 + 1);
      await expect(vault.connect(owner).emergencyWithdraw())
        .to.be.revertedWith('Must initiate first');
    });

    it('reverts when non-owner initiates', async function () {
      await expect(vault.connect(alice).initiateEmergencyWithdraw()).to.be.reverted;
    });
  });
});
