const auctionData = [
  { title: '$0.00', tokenId: 0, url: './auctions/0', img: './assets/0.jpg' },
  { title: '$0.01', tokenId: 1, url: './auctions/1', img: './assets/1.jpg' },
  { title: '$0.05', tokenId: 2, url: './auctions/2', img: './assets/2.jpg' },
  { title: '$0.10', tokenId: 3, url: './auctions/3', img: './assets/3.jpg' },
  { title: '$0.25', tokenId: 4, url: './auctions/4', img: './assets/4.jpg' },
  { title: '$0.50', tokenId: 5, url: './auctions/5', img: './assets/5.jpg' },
  { title: '$1.00', tokenId: 6, url: './auctions/6', img: './assets/6.jpg' },
  { title: '$2.00', tokenId: 7, url: './auctions/7', img: './assets/7.jpg' },
  { title: '$5.00', tokenId: 8, url: './auctions/8', img: './assets/8.jpg' },
  { title: '$6.67', tokenId: 9, url: './auctions/9', img: './assets/9.jpg' },
  { title: '$10.00', tokenId: 10, url: './auctions/10', img: './assets/10.jpg' },
  { title: '$20.00', tokenId: 11, url: './auctions/11', img: './assets/11.jpg' },
  { title: '$50.00', tokenId: 12, url: './auctions/12', img: './assets/12.jpg' },
  { title: '$50.32', tokenId: 13, url: './auctions/13', img: './assets/13.jpg' },
  { title: '$100.00', tokenId: 14, url: './auctions/14', img: './assets/14.jpg' },
  { title: '$???.??', tokenId: 15, url: './auctions/15', img: './assets/15.jpg' },
]

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


const $lastUpdated = $.id('lastUpdated')
const $connectedAs1 = $.id('connectedAs1')
const $connectedAs2 = $.id('connectedAs2')
const $connectedBalance = $.id('connectedBalance')
const $connectedNetwork = $.id('connectedNetwork')
const $submitBid = $.id('submitBid')
const $newBidAmount = $.id('newBidAmount')
const $timeLeftSection = $.id('timeLeftSection')
const $activeBidSection = $.id('activeBidSection')
const $highestBidSection = $.id('highestBidSection')
const $makeBidSection = $.id('makeBidSection')
const $timeLeft = $.id('timeLeft')
const $timeDiff = $.id('timeDiff')
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

const $question = $.id('question')
const $answer = $.id('answer')
const $answerX = $.id('answerX')
const $answerContent = $.id('answerContent')

const $biddingHelp = $.id('biddingHelp')
const $wantsNotifications = $.id('wantsNotifications')


$.cls('imgContainer')[0].innerHTML = `
  <a href="../assets/${AUCTION_ID}.jpg">
    <img src="../assets/${AUCTION_ID}.jpg">
  </a>
`


let notificationPermission, lastBid

if ($wantsNotifications) $wantsNotifications.onclick = () => {
  if ($wantsNotifications.checked) {
    notificationPermission = Notification.requestPermission()
  } else {
    notificationPermission = false
  }
}

let stopActiveCountdownInterval = () => {}
let setMinBid = false
async function updateBidInfo(signer, steviepAuction, uniswapV2) {
  const bidRequest = rawSteviepAuction.queryFilter(bidFilter).then(rawBids =>
    Promise.all(
      rawBids.map(
        async e => ({
          bidder: e.args.bidder,
          bidderDisplay: await formatAddr(e.args.bidder, provider),
          amount: ethVal(e.args.amount),
          auctionId: bnToN(e.args.auctionId),
          timestamp: bnToN(e.args.timestamp),
        })
      )
    )
  )

  const signerAddr = await signer.getAddress()
  const [
    highestBid,
    auction,
    auctionEndTime,
    isActive,
    isSettled,
    blockNumber,
    formattedAddr,
    unsortedBidsMade,
    connectedBalance,
    connectedNetwork,
    ethUsd
  ] = await Promise.all([
    steviepAuction.auctionIdToHighestBid(AUCTION_ID + 16),
    steviepAuction.auctionIdToAuction(AUCTION_ID + 16),
    steviepAuction.auctionEndTime(AUCTION_ID + 16),
    steviepAuction.isActive(AUCTION_ID + 16),
    steviepAuction.isSettled(AUCTION_ID + 16),
    provider.provider.getBlockNumber(),
    formatAddr(signerAddr, provider),
    bidRequest,
    provider.getETHBalance(signerAddr),
    provider.getNetwork(),
    getEthUsd(uniswapV2)
  ])


  const hasBid = !!bnToN(highestBid.timestamp)
  const blockTimestamp = (await provider.provider.getBlock(blockNumber)).timestamp
  const timeDiff = Date.now() - blockTimestamp*1000

  $lastUpdated.innerHTML = `Local timestamp: ${new Date()} <br>Block timestamp: ${new Date(blockTimestamp*1000)}<br>[Block: ${blockNumber}]<br><strong><a href="https://${etherscanPrefix}etherscan.io/address/${STEVIEP_AUCTION}" target="_blank" rel="nofollow" style="font-family:monospace">AUCTION CONTRACT</a></strong>`
  if (isENS(formattedAddr)) {
    $connectedAs1.innerHTML = formattedAddr
  }
  $connectedAs2.innerHTML = `<a href="https://${etherscanPrefix}etherscan.io/address/${signerAddr}" target="_blank" class="address">${signerAddr}</a>`
  $connectedBalance.innerHTML = `Balance: ${ethVal(connectedBalance)} ETH`

  let networkName, networkDescriptor
  if (connectedNetwork.name && connectedNetwork.name !== 'unknown') {
    networkName = connectedNetwork.chainId === 1 ? 'mainnet' : connectedNetwork.name
    networkDescriptor = 'Network'
  } else {
    networkName = connectedNetwork.chainId
    networkDescriptor = 'Network ID'
  }

  $connectedNetwork.innerHTML = `${networkDescriptor}: ${networkName}`

  const bidsMade = unsortedBidsMade.sort((a,b) => b.timestamp - a.timestamp)


  if (!hasBid) {
    hide($bidHistory)
    unhide($makeBidSection)

    if (!setMinBid) $newBidAmount.value = formatMinBid(ethVal(auction.minBid))

  } else if (isActive) {
    unhide($makeBidSection)
    unhide($timeLeftSection)
    unhide($highestBidSection)
    unhide($activeBidSection)
    unhide($bidHistory)
    if (!setMinBid) $newBidAmount.value = formatMinBid(ethVal(highestBid.amount) * (1 + auction.bidIncreaseBps/10000))

    const bidAmount = ethVal(highestBid.amount)
    $highestBidAmount.innerHTML = `${bidAmount} ETH <div class="bidUSD">(~$${(bidAmount * ethUsd).toFixed(2)})</div>`
    $highestBidder.innerHTML = `<a href="https://${etherscanPrefix}etherscan.io/address/${highestBid.bidder}" target="_blank" class="address">${await formatAddr(highestBid.bidder, provider, false)}</a>`


    stopActiveCountdownInterval()
    const timeLeft = bnToN(auctionEndTime)*1000 - Date.now()
    stopActiveCountdownInterval = triggerTimer(timeLeft, $timeLeft)
    if (timeLeft < 120000) $timeDiff.innerHTML = `*Your web browser is <br>~${Math.abs(timeDiff/1000)} seconds ${timeDiff < 0 ? 'behind' : 'ahead of'} <br>the blockchain`

    if (!lastBid) {
      lastBid = bidAmount
    } else if (notificationPermission && (bidAmount !== lastBid)) {
      lastBid = bidAmount

      notificationPermission.then(p => {
        const notification = new Notification(`💵 New Cold Hard Cash Bid 💵`, {
          body: `${auctionData[AUCTION_ID].title} → ${bidAmount} ETH`,
          icon: `../assets/${AUCTION_ID}.jpg`,
          requireInteraction: true
        })
      })
    } else if (bidAmount !== lastBid) {
      lastBid = bidAmount
    }

  } else if (!isActive && !isSettled) {
    hide($makeBidSection)
    hide($timeLeftSection)
    unhide($highestBidSection)
    unhide($settlementSection)
    unhide($activeBidSection)
    unhide($bidHistory)

    $highestBidLabel.innerHTML = 'WINNING BID'

    $highestBidAmount.innerHTML = ethVal(highestBid.amount) + ' ETH'
    $highestBidder.innerHTML = `<a href="https://${etherscanPrefix}etherscan.io/address/${highestBid.bidder}" target="_blank" class="address">${await formatAddr(highestBid.bidder, provider, false)}</a>`


  } else if (!isActive && isSettled) {
    hide($makeBidSection)
    hide($timeLeftSection)
    hide($settlementSection)
    unhide($highestBidSection)
    unhide($activeBidSection)
    unhide($bidHistory)

    $highestBidLabel.innerHTML = 'WINNING BID'
    $highestBidAmount.innerHTML = ethVal(highestBid.amount) + ' ETH'
    $highestBidder.innerHTML = `<a href="https://${etherscanPrefix}etherscan.io/address/${highestBid.bidder}" target="_blank" class="address">${await formatAddr(highestBid.bidder, provider, false)}</a>`

  }
  setMinBid = true

  if (bidsMade.length) {
    $previousBidList.innerHTML = bidsMade.map(bid => {
      const bidAmount = Number(bid.amount.toFixed(14))
      const bidAmountUSD = (bidAmount * ethUsd).toFixed(2)
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


  const formatTime = (amt, measurement) => Math.round(amt*100)/100 + ' ' + (amt === 1 ? measurement : measurement + 's')
  const formatDuration = duration =>
    duration < 60 ? formatTime(duration, 'second') :
    duration < 3600 ? formatTime(duration / 60, 'minute') :
    duration <= 86400 ? formatTime(duration / 3600, 'hour') :
    formatTime(duration / 86400, 'day')


  const auctionLength = formatDuration(auction.duration)
  const reservePrice = ethVal(auction.minBid)
  const bidExtension = formatDuration(bnToN(auction.bidTimeExtension))
  const bidIncrease = bnToN(auction.bidIncreaseBps) / 100 + '%'

  $answerContent.innerHTML = `
    <ul>
      <li>This auction has ${reservePrice ? `a reserve price of ${reservePrice} ETH` : 'no reserve price'}.</li>
      <li>Once the first bid is made, the auction will last ${auctionLength}.</li>
      <li>All bids made in the final ${bidExtension} will extend the auction.</li>
      <li>All bids must be ${bidIncrease} higher than the previous bid.</li>
      <li>Bids cannot be withdrawn once they are made.</li>
      <li>All bids must be made in ETH.</li>
    </ul>
  `
console.log(auction.rewardContract, auction.allowListContract)

  // if (auction.allowListContract !== ZERO_ADDR) {
  //   const allowList = await provider.contract(auction.allowListContract, allowListContractABI)

  //   if (bnToN(await allowList.balanceOf(signerAddr)) === 0) {
  //     $bidderSecondaryInfo.innerHTML = 'You must own at least 1 Free token to bid'
  //     $submitBid.disabled = true
  //   } else {
      $submitBid.disabled = false
      if (auction.rewardContract !== ZERO_ADDR) {
        const $wantsReward = $.id('wantsReward')
        const checked = !$wantsReward || $wantsReward.checked
        $bidderSecondaryInfo.innerHTML = `
          <label>
            Recieve 1 FastCash per bid: <input id="wantsReward" type="checkbox" ${checked ? 'checked' : ''}>
          </label>
        `

      } else {
        $bidderSecondaryInfo.innerHTML = ''
      }

  //   }
  // } else {
  //   $bidderSecondaryInfo.innerHTML = ''
  //   $submitBid.disabled = false
  // }


}

provider.onConnect(async () => {
  const steviepAuction = await provider.contract(STEVIEP_AUCTION, auctionABI)
  const uniswapV2 = await provider.contract(UNISWAP_V2, uniswapV2ABI)
  const rawSteviepAuction = provider.rawContract(STEVIEP_AUCTION, auctionABI)

  setRunInterval(() => updateBidInfo(provider.signer, steviepAuction, uniswapV2), 3000)


  $submitBid.onclick = async () => {
    hide($bidSectionContent)
    hide($biddingHelp)
    unhide($bidSectionLoading)
    $bidSectionError.innerHTML = ''
    $bidSectionLoadingMessage.innerHTML = 'Submitting...'

    try {
      const [highestBid, auction] = await Promise.all([
        steviepAuction.auctionIdToHighestBid(AUCTION_ID + 16),
        steviepAuction.auctionIdToAuction(AUCTION_ID + 16),
      ])

      const minBid = highestBid.amount
        ? ethVal(highestBid.amount) * (1 + auction.bidIncreaseBps/10000)
        : ethVal(auction.minBid)

      if ($newBidAmount.value < minBid) {
        throw new Error(`Bid must be at least ${minBid} ETH`)
      }

      const $wantsReward = $.id('wantsReward')
      const wantsReward = $wantsReward && $wantsReward.checked
      const tx = await rawSteviepAuction.connect(provider.signer).bid(AUCTION_ID + 16, wantsReward, ethValue($newBidAmount.value))

      $bidSectionLoadingMessage.innerHTML = `TX Pending. <a href="https://${etherscanPrefix}etherscan.io/tx/${tx.hash}" target="_blank">View on etherscan</a>`

      const txReciept1 = await tx.wait(1)

      setMinBid = false
      updateBidInfo(provider.signer, steviepAuction, uniswapV2)

      const auctionsBidOn = ls.get('__AUCTIONS_BID_ON__') || {}
      auctionsBidOn[AUCTION_ID + 16] = true
      ls.set('__AUCTIONS_BID_ON__', JSON.stringify(auctionsBidOn))

      unhide($bidSectionContent)
      unhide($biddingHelp)
      hide($bidSectionLoading)

    } catch (e) {
      unhide($bidSectionContent)
      hide($bidSectionLoading)
      if (e.data) {
        $bidSectionError.innerHTML = e.data.message
      } else {
        $bidSectionError.innerHTML = e.message
      }
    }
  }


  $submitSettlement.onclick = async () => {
    hide($settlementSectionContent)
    unhide($settlementSectionLoading)
    $settlementSectionError.innerHTML = ''
    $settlementSectionLoadingMessage.innerHTML = 'Submitting...'

    try {
      const tx = await rawSteviepAuction.connect(provider.signer).settle(AUCTION_ID + 16)

      $settlementSectionLoadingMessage.innerHTML = `TX Pending. <a href="https://${etherscanPrefix}etherscan.io/tx/${tx.hash}" target="_blank">View on etherscan</a>`

      const txReciept1 = await tx.wait(1)

      updateBidInfo(provider.signer, steviepAuction, uniswapV2)

      unhide($settlementSectionContent)
      hide($settlementSectionLoading)

    } catch (e) {
      unhide($settlementSectionContent)
      hide($settlementSectionLoading)
      if (e.data) {
        $settlementSectionError.innerHTML = e.data.message
      } else {
        $settlementSectionError.innerHTML = e.message
      }
    }
  }
})


let showingAnswer = false
$question.onclick = () => {
  showingAnswer = true
  hide($question)
  unhide($answer)
}

$answerX.onclick = () => {
  showingAnswer = false
  unhide($question)
  hide($answer)
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
async function formatAddr(addr, provider, truncate=true) {
  try {
    const ens = await provider.getENS(addr)
    if (ens.slice(-4) === '.eth') {
      return ens.length > 19
        ? ens.slice(0, 16) + '...'
        : ens
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
