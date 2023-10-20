  const ETHUSD = 1566.61

  const auctionData = ALL_AUCTIONS



const provider = new Web3Provider()
mountComponents(
  ConnectWallet(provider, 'connectWallet'),
  ConnectButton(provider),
)

const network = 'mainnet'

const etherscanPrefix = network === 'goerli' ? 'goerli.' : ''

  const STEVIEP_AUCTION = {
    // local: '0x46d4674578a2daBbD0CEAB0500c6c7867999db34'
    local: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    goerli: '0x39665bCA42F60413b2E162a24a2FE1B290F5a2f9',
    mainnet: '0xd577B12732DA7557Db7eeA82e53d605f42C618d8',
  }[network]

  const UNISWAP_V2 = {
    // local: '0xC220Ed128102d888af857d137a54b9B7573A41b2',
    local: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    goerli: '0xB3ca1a2F6dAD720B5D89cc2cf2B0160aB357f13E',
    mainnet: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'
  }[network]


const auctionStruct = `(
  bool tokenExists,
  uint256 duration,
  uint256 bidIncreaseBps,
  uint256 bidTimeExtension,
  uint256 minBid,
  uint256 tokenId,
  uint256 startTime,
  address beneficiary,
  bool approveFutureTransfer,
  address minterContract,
  address rewardContract,
  address allowListContract
)`

const auctionABI = [
  'event BidMade(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 timestamp)',
  'function auctionCount() external view returns (uint256)',
  'function auctionIdToHighestBid(uint256) external view returns (uint256 amount, uint256 timestamp, address bidder)',
  'function auctionEndTime(uint256) external view returns (uint256 endTime)',
  `function auctionIdToAuction(uint256) external view returns (${auctionStruct})`,
  'function isActive(uint256 auctionId) external view returns (bool)',
  'function isSettled(uint256 auctionId) external view returns (bool)',
  'function bid(uint256 auctionId, bool wantsReward) external payable',
  'function settle(uint256 auctionId) external payable',
]

const uniswapV2ABI = [
  'function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
]

const allowListContractABI = [
  'function balanceOf(address) external view returns (uint256)'
]


const rawSteviepAuction = provider.rawContract(STEVIEP_AUCTION, auctionABI)

const bidFilter = rawSteviepAuction.filters.BidMade(AUCTION_ID + 16)


// const $lastUpdated = $.id('lastUpdated')
// const $connectedAs1 = $.id('connectedAs1')
// const $connectedAs2 = $.id('connectedAs2')
// const $connectedBalance = $.id('connectedBalance')
// const $connectedNetwork = $.id('connectedNetwork')
// const $submitBid = $.id('submitBid')
// const $newBidAmount = $.id('newBidAmount')
// const $timeLeftSection = $.id('timeLeftSection')
const $activeBidSection = $.id('activeBidSection')
const $highestBidSection = $.id('highestBidSection')
// const $makeBidSection = $.id('makeBidSection')
// const $timeLeft = $.id('timeLeft')
// const $timeDiff = $.id('timeDiff')
const $bidSectionContent = $.id('bidSectionContent')
const $bidSectionError = $.id('bidSectionError')
const $bidSectionLoadingMessage = $.id('bidSectionLoadingMessage')
const $bidSectionLoading = $.id('bidSectionLoading')
const $highestBidAmount = $.id('highestBidAmount')
const $highestBidder = $.id('highestBidder')
const $bidHistory = $.id('bidHistory')
const $previousBidList = $.id('previousBidList')
const $highestBidLabel = $.id('highestBidLabel')
const $bidderSecondaryInfo = $.id('bidderSecondaryInfo')

const $settlementSection = $.id('settlementSection')
const $settlementSectionContent = $.id('settlementSectionContent')
const $submitSettlement = $.id('submitSettlement')
const $settlementSectionError = $.id('settlementSectionError')
const $settlementSectionLoading = $.id('settlementSectionLoading')
const $settlementSectionLoadingMessage = $.id('settlementSectionLoadingMessage')



const $reserveSection = $.id('reserveSection')
const $reserveLabel = $.id('reserveLabel')
const $reserveAmount = $.id('reserveAmount')
const $redeemedValue = $.id('redeemedValue')
const $osLink = $.id('osLink')

// const $question = $.id('question')
// const $answer = $.id('answer')
// const $answerX = $.id('answerX')
// const $answerContent = $.id('answerContent')

const $biddingHelp = $.id('biddingHelp')
// const $wantsNotifications = $.id('wantsNotifications')


$.cls('imgContainer')[0].innerHTML = `
  <a href="../assets/${AUCTION_ID}.jpg">
    <img src="../assets/${AUCTION_ID}.jpg">
  </a>
`



$osLink.innerHTML = `<a href="https://opensea.io/assets/ethereum/0x6dea3f6f1bf5ce6606054baabf5452726fe4dea1/${AUCTION_ID}" target="_blank" rel="nofollow">View on OpenSea</a>`


let notificationPermission, lastBid

// if ($wantsNotifications) $wantsNotifications.onclick = () => {
//   if ($wantsNotifications.checked) {
//     notificationPermission = Notification.requestPermission()
//   } else {
//     notificationPermission = false
//   }
// }

let stopActiveCountdownInterval = () => {}
let setMinBid = false


const AUCTION = ALL_AUCTIONS.find(a => a.auctionId - 16 === AUCTION_ID)


  $highestBidLabel.innerHTML = 'WINNING BID'
    $highestBidAmount.innerHTML = AUCTION.bidAmount + ' ETH' + ` <div class="bidUSD">(~$${(AUCTION.bidAmount * ETHUSD).toFixed(2)})`
    $highestBidder.innerHTML = `
      <a href="https://etherscan.io/address/${AUCTION.highestBidderAddr}" target="_blank">
        <span class="address mobile">${formatAddrOffline(AUCTION.highestBidderAddr)}</span>
        <span class="address desktop">${AUCTION.highestBidderAddr}</span>
      </a>
    `

    $reserveAmount.innerHTML = AUCTION.reservePrice + ' ETH' + ` <div class="bidUSD">(~$${(AUCTION.reservePrice * ETHUSD).toFixed(2)})`


    $redeemedValue.innerHTML = `<code style="text-align: left">${AUCTION.redeemed}</code>`

    const unsortedBidsMade = ALL_BIDS_MADE.filter(bid => bid.auctionId-16 === AUCTION_ID)

    const bidsMade = unsortedBidsMade.sort((a,b) => b.timestamp - a.timestamp)
    if (bidsMade.length) {
      $previousBidList.innerHTML = bidsMade.map(bid => {
        const bidAmount = Number(bid.amount.toFixed(14))
        const bidAmountUSD = (bidAmount * ETHUSD).toFixed(2)
        const bidAmountPretty = String(bidAmount).includes('.') ? bidAmount : bidAmount.toFixed(1)
        return `
          <li class="bidHistoryItem">
            <div class="bidHistoryRow">
              <div>BID: ${bidAmountPretty} ETH (~$${bidAmountUSD})</div>
              <div>
                <a href="https://${etherscanPrefix}etherscan.io/address/${bid.bidder}" target="_blank" class="address">${bid.bidderDisplay}</a>
              </div>
            </div>
            <div>${new Date(bid.timestamp * 1000)}</div>
          </li>
        `
      }).join('')
    }


async function getEthUsd(uniswapV2) {
  const decimals = 2
  const { _reserve0, _reserve1 } = await uniswapV2.getReserves()
  return _reserve0.mul(1000000000000).mul(10**decimals).div(_reserve1).toNumber() / 10**decimals
}




function formatMinBid(amt) {
  return Math.ceil(amt * 1000) / 1000
}

function isENS(ens) {
  return ens.slice(-4) === '.eth'
}
async function formatAddr(addr, provider, truncate=true, nameLength=19) {
  try {
    const ens = await provider.getENS(addr)
    if (ens.slice(-4) === '.eth') {
      return ens.length > nameLength
        ? ens.slice(0, nameLength-3) + '...'
        : ens
    } else {
      return truncate ? truncateAddr(addr) : addr
    }
  } catch (e) {
    return truncate ? truncateAddr(addr) : addr
  }
}

function formatAddrOffline(addr, truncate=true, nameLength=19) {
  try {
    if (addr.slice(-4) === '.eth') {
      return addr.length > nameLength
        ? addr.slice(0, nameLength-3) + '...'
        : addr
    } else {
      return truncate ? truncateAddr(addr) : addr
    }
  } catch (e) {
    return truncate ? truncateAddr(addr) : addr
  }
}


function unhide(element) {
  $(element, 'display', '')
}

function hide(element) {
  $(element, 'display', 'none')
}

function setRunInterval(fn, ms, i=0) {
  const run = () => {
    fn(i)
    i++
  }

  run()

  let isCleared = false

  let interval = setInterval(run, ms)

  const newInterval = (ms) => {
    if (isCleared) return
    clearInterval(interval)
    interval = setInterval(run, ms)
  }

  const stopInterval = () => {
    if (!isCleared) {
      clearInterval(interval)
      isCleared = true
    }
  }
  return stopInterval
}

function triggerTimer(timeLeft, $elem) {
  const with0 = x => x < 10 ? '0' + Math.floor(x) : Math.floor(x)
  let timeLeftCounter = timeLeft
  return setRunInterval(() => {
    timeLeftCounter = Math.max(timeLeftCounter - 1000, 0)
    const days = timeLeftCounter / (24*60*60*1000)
    const hours = 24 * (days%1)
    const minutes = 60 * (hours%1)
    const seconds = Math.floor(60 * (minutes%1))
    const ms = Math.floor(timeLeftCounter % 1000 / 100) % 10

    if (timeLeft < 300000) $elem.innerHTML = `*Your web browser is <br>~${Math.abs(timeDiff/1000)} seconds ${timeDiff < 0 ? 'behind' : 'ahead of'} <br>the blockchain`


    $elem.innerHTML = `${Math.floor(days)}:${with0(hours)}:${with0(minutes)}:${with0(seconds)}`
  }, 1000)
}
