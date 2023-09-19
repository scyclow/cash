// SPDX-License-Identifier: MIT

// contract by steviep.eth

import "./Dependencies.sol";

pragma solidity ^0.8.17;


contract ColdHardCash is ERC721, Ownable {
  uint256 public totalSupply;
  address public minter;

  TokenURI public tokenURIContract;

  mapping(uint256 => bool) public isRedeemed;

  event MetadataUpdate(uint256 _tokenId);
  event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

  address private _royaltyBeneficiary;
  uint16 private _royaltyBasisPoints = 1000;

  constructor() ERC721('Cold Hard Cash', 'CASH') {
    minter = msg.sender;
    tokenURIContract = new TokenURI();
  }

  function setRedeemed(uint256 tokenId) external onlyOwner {
    isRedeemed[tokenId] = true;
    emit MetadataUpdate(tokenId);
  }

  function exists(uint256 tokenId) external view returns (bool) {
    return _exists(tokenId);
  }

  function mint(address recipient, uint256 tokenId) public {
    require(minter == msg.sender, 'Caller is not the minting address');
    require(tokenId < 16);

    _mint(recipient, tokenId);
    totalSupply++;
  }

  function setMinter(address newMinter) external onlyOwner {
    minter = newMinter;
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    return TokenURI(tokenURIContract).tokenURI(tokenId);
  }

  function setURIContract(address _uriContract) external onlyOwner {
    tokenURIContract = TokenURI(_uriContract);
    emit BatchMetadataUpdate(0, 16);
  }


  function setRoyaltyInfo(
    address royaltyBeneficiary,
    uint16 royaltyBasisPoints
  ) external onlyOwner {
    _royaltyBeneficiary = royaltyBeneficiary;
    _royaltyBasisPoints = royaltyBasisPoints;
  }

  function royaltyInfo(uint256, uint256 _salePrice) external view returns (address, uint256) {
    return (_royaltyBeneficiary, _salePrice * _royaltyBasisPoints / 10000);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
    // ERC2981 & ERC4906
    return interfaceId == bytes4(0x2a55205a) || interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
  }
}



contract TokenURI {
  using Strings for uint256;

  ColdHardCash public baseContract;
  string public baseURI = '/';
  string public externalUrl = 'https://steviep.xyz/cash';
  string public description = 'Each Cold Hard Cash (CASH) token represents an option on the mailing of the physical currency represented in each token thumbnail. All shipments will be made at the expense of the token holder. The Artist shall not be held liable for any shipments lost in the mail. In addition, the Artist shall make a good faith effort to store all physical currency, but makes no guarantee on their ability to carry out said shipment. Please contact the Artist directly to arrange a shipment.';


  mapping(uint256 => string) public tokenIdToName;

  constructor() {
    baseContract = ColdHardCash(msg.sender);

    tokenIdToName[0] = '$0.00';
    tokenIdToName[1] = '$0.01';
    tokenIdToName[2] = '$0.05';
    tokenIdToName[3] = '$0.10';
    tokenIdToName[4] = '$0.25';
    tokenIdToName[5] = '$0.50';
    tokenIdToName[6] = '$1.00';
    tokenIdToName[7] = '$2.00';
    tokenIdToName[8] = '$5.00';
    tokenIdToName[9] = '$6.79';
    tokenIdToName[10] = '$10.00';
    tokenIdToName[11] = '$20.00';
    tokenIdToName[12] = '$50.00';
    tokenIdToName[13] = '$50.32';
    tokenIdToName[14] = '$100.00';
    tokenIdToName[15] = '$???.??';
  }

  function tokenURI(uint256 tokenId) public view  returns (string memory) {
    bytes memory json = abi.encodePacked(
      'data:application/json;utf8,',
      '{"name": "', tokenIdToName[tokenId],'",',
      '"description": "', description, '",',
      '"image": "', baseURI, tokenId.toString(), '",',
      '"attributes": [{"trait_type": "Physical has been redeemed", "value": "', baseContract.isRedeemed(tokenId) ? 'True' : 'False', '"}],',
      '"external_url": "', externalUrl, '"',
      '}'
    );
    return string(json);
  }


  function updateURI(string memory newURI, string memory newExternalURL) external {
    require(msg.sender == baseContract.owner(), 'Cannot update');
    baseURI = newURI;
    externalUrl = newExternalURL;
  }
}

