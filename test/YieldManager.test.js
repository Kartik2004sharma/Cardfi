const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('YieldManager', function () {
  let manager;
  let usdc;
  let owner;
  let keeper;
  let alice;
  
  let dummyAavePool;
  let dummyCompoundCToken;

  const USDC_DECIMALS = 6n;
  const ONE_USDC = 10n ** USDC_DECIMALS;
  const DEPOSIT_AMOUNT = 1000n * ONE_USDC;

  beforeEach(async function () {
    [owner, keeper, alice, dummyAavePool, dummyCompoundCToken] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory('MockUSDC');
    usdc = await MockUSDCFactory.deploy();

    const ManagerFactory = await ethers.getContractFactory('YieldManager');
    manager = await ManagerFactory.deploy(await usdc.getAddress());

    await usdc.mint(alice.address, DEPOSIT_AMOUNT * 10n);
  });

  describe('Strategy Management', function () {
    it('BUG-FIX: adds strategy with enum Protocol type', async function () {
      await manager.connect(owner).addStrategy(
        'aave-usdc',
        'Aave',
        dummyAavePool.address,
        await usdc.getAddress(),
        800n,
        1n,
        1n // Protocol.AAVE
      );

      const strategy = await manager.strategies('aave-usdc');
      expect(strategy.name).to.equal('Aave');
      expect(strategy.protocolType).to.equal(1n);
    });

    it('reverts when Protocol.NONE is used', async function () {
      await expect(
        manager.connect(owner).addStrategy(
          'aave-usdc',
          'Aave',
          dummyAavePool.address,
          await usdc.getAddress(),
          800n,
          1n,
          0n // Protocol.NONE
        )
      ).to.be.revertedWith('Protocol type must be specified');
    });
  });

  describe('Access Control', function () {
    it('BUG-FIX: onlyKeeper modifier protects autoRebalance', async function () {
      await expect(manager.connect(alice).autoRebalance(alice.address))
        .to.be.revertedWith('Not a keeper');
    });

    it('owner can set keeper and keeper can call autoRebalance', async function () {
      await manager.connect(owner).setKeeper(keeper.address, true);
      await expect(manager.connect(keeper).autoRebalance(alice.address))
        .to.be.revertedWith('Auto-rebalance not configured');
    });
  });
});
