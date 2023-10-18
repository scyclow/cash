const { expect } = require('chai')
const { ethers, waffle } = require('hardhat')
const { expectRevert, time, snapshot } = require('@openzeppelin/test-helpers')

const toETH = amt => ethers.utils.parseEther(String(amt))
const bidAmount = amt => ({ value: toETH(amt) })
const ethVal = n => Number(ethers.utils.formatEther(n))
const num = n => Number(n)


function times(t, fn) {
  const out = []
  for (let i = 0; i < t; i++) out.push(fn(i))
  return out
}

const utf8Clean = raw => raw.replace(/data.*utf8,/, '')
const getJsonURI = rawURI => JSON.parse(utf8Clean(rawURI))



const ONE_DAY = 60 * 60 * 24
const TEN_MINUTES = 60 * 10
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
const safeTransferFrom = 'safeTransferFrom(address,address,uint256)'
const bid = 'bid(uint256)'
const bidWithReward = 'bid(uint256,bool)'

const expectOwnableError = p => expectRevert(p, 'Ownable: caller is not the owner')
const createGenericAuction = () => SteviepAuction.connect(admin).create(false, ONE_DAY, 1000, TEN_MINUTES, 0, 0, admin.address, false, MinterMock.address, ZERO_ADDR, ZERO_ADDR)
const contractBalance = contract => contract.provider.getBalance(contract.address)

let admin, bidder1, bidder2
let SteviepAuction, ColdHardCash, FastCashMoneyPlus, TokenURIv2


const auctionSetup = async () => {
  const signers = await ethers.getSigners()

  admin = signers[0]
  bidder1 = signers[1]
  bidder2 = signers[2]
  randomBeneficiary = signers[3]
  const fastCashCentralBanker = await ethers.getImpersonatedSigner('0x47144372eb383466D18FC91DB9Cd0396Aa6c87A4')


  const SteviepAuctionFactory = await ethers.getContractFactory('SteviepAuctionV1', admin)
  SteviepAuction = await SteviepAuctionFactory.deploy()
  await SteviepAuction.deployed()

  const ColdHardCashFactory = await ethers.getContractFactory('ColdHardCash', admin)
  ColdHardCash = await ColdHardCashFactory.deploy()
  await ColdHardCash.deployed()

  const FastCashBidRewardFactory = await ethers.getContractFactory('FastCashBidReward', admin)
  FastCashBidReward = await FastCashBidRewardFactory.deploy()
  await FastCashBidReward.deployed()

  FastCashMoneyPlus = await ethers.getContractAt(
    [
      'function transferFromBank(address to, uint256 amount) external',
      'function balanceOf(address account) external view returns (uint256)'
    ],
    '0xcA5228D1fe52D22db85E02CA305cddD9E573D752'
  )

  const TokenURIv2Factory = await ethers.getContractFactory('TokenURIv2', admin)
  TokenURIv2 = await TokenURIv2Factory.deploy()
  await TokenURIv2.deployed()

  await ColdHardCash.connect(admin).setMinter(SteviepAuction.address)
  await FastCashBidReward.connect(admin).setMinter(SteviepAuction.address)
  await FastCashMoneyPlus.connect(fastCashCentralBanker).transferFromBank(FastCashBidReward.address, toETH(100))

  await Promise.all(
    times(16, i =>
      SteviepAuction.connect(admin).create(
        false,
        ONE_DAY,
        1000,
        TEN_MINUTES,
        111,
        i,
        admin.address,
        false,
        ColdHardCash.address,
        FastCashBidReward.address,
        '0x30b541f1182ef19c56a39634B2fdACa5a0F2A741', // Free
      )
    )
  )

  const Free0 = await ethers.getContractAt(['function claim() external'], '0x5E965A4B2b53AaeCFaB51368f064c98531947A26')
  await Free0.connect(bidder1).claim()
}





describe('SteviepAuction', () => {
  beforeEach(async () => {
    await auctionSetup()
  })

  describe('create', () => {
    it('happy path', async () => {


      expect(await ColdHardCash.connect(admin).totalSupply()).to.equal(0)
      expect(await ColdHardCash.connect(admin).exists(3)).to.equal(false)

      await SteviepAuction.connect(bidder1)[bidWithReward](3, true, bidAmount(0.12345))

      await expectRevert(
        SteviepAuction.connect(bidder2)[bidWithReward](3, true, bidAmount(0.2)),
        'Bidder not on allow list'
      )

      await time.increase(time.duration.seconds(ONE_DAY + 1))

      await SteviepAuction.connect(bidder1).settle(3)

      expect(await ColdHardCash.connect(admin).totalSupply()).to.equal(1)
      expect(await ColdHardCash.connect(admin).exists(3)).to.equal(true)
      expect(await ColdHardCash.connect(admin).exists(0)).to.equal(false)




      await SteviepAuction.connect(bidder1)[bidWithReward](0, true, bidAmount(0.1))
      await time.increase(time.duration.seconds(ONE_DAY + 1))

      await SteviepAuction.connect(bidder1).settle(0)
      expect(await ColdHardCash.connect(admin).exists(0)).to.equal(true)

      expect(await ColdHardCash.connect(admin).ownerOf(0)).to.equal(bidder1.address)
      expect(await ColdHardCash.connect(admin).ownerOf(3)).to.equal(bidder1.address)

      await expectRevert(
        ColdHardCash.connect(bidder1).setRedeemed(0),
        'Ownable: caller is not the owner'
      )

      await expectRevert(
        ColdHardCash.connect(bidder1).setMinter(bidder1.address),
        'Ownable: caller is not the owner'
      )

      await expectRevert(
        ColdHardCash.connect(bidder1).setURIContract(bidder1.address),
        'Ownable: caller is not the owner'
      )

      await expectRevert(
        ColdHardCash.connect(bidder1).setRoyaltyInfo(bidder1.address, 10),
        'Ownable: caller is not the owner'
      )


      expect(await ColdHardCash.connect(admin).isRedeemed(0)).to.equal(false)
      await ColdHardCash.connect(admin).setRedeemed(0)
      expect(await ColdHardCash.connect(admin).isRedeemed(0)).to.equal(true)
      await ColdHardCash.connect(admin).setRedeemed(0)
      expect(await ColdHardCash.connect(admin).isRedeemed(0)).to.equal(true)

      console.log(await ColdHardCash.connect(admin).tokenURI(0))

      const uri0 = getJsonURI(await ColdHardCash.connect(admin).tokenURI(0))
      const uri3 = getJsonURI(await ColdHardCash.connect(admin).tokenURI(3))

      console.log(uri0.attributes)

      expect(uri0.attributes.length).to.equal(2)
      expect(uri3.attributes.length).to.equal(2)

      expect(uri0.attributes[0].trait_type).to.equal('Physical Redeemed')
      expect(uri0.attributes[1].trait_type).to.equal('Original Sale Price')

      expect(uri0.attributes[0].value).to.equal('True')
      expect(uri3.attributes[0].value).to.equal('False')

      expect(uri0.attributes[1].value).to.equal('100000000000000000 wei')
      expect(uri3.attributes[1].value).to.equal('123450000000000000 wei')
      expect(ethVal(await FastCashMoneyPlus.connect(admin).balanceOf(bidder1.address))).to.equal(2)

      await ColdHardCash.connect(admin).setURIContract(TokenURIv2.address)
      expect(await ColdHardCash.connect(admin).tokenURIContract()).to.equal(TokenURIv2.address)

    })
  })

})



