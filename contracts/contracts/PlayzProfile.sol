// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PlayzProfile is ERC1155URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Address for address payable;

    string public profileURI;

    Counters.Counter private tokenCounter;
    mapping(uint256 => uint256) private _tokenSupplies;
    mapping(uint256 => uint256) private _tokenCounts;
    mapping(uint256 => uint256) private _tokenPrices;
    mapping(uint256 => uint256) private _tokenRoyalties;
    mapping(uint256 => bool) private _isMemberEdition;

    // ==================== EVENTS ====================

    event EditionCreated(
        uint256 tokenId,
        string tokenURI,
        uint256 tokenSupply,
        uint256 tokenPrice,
        uint256 royaltyPercentage
    );
    event MembershipCreated(
        string tokenURI,
        uint256 tokenSupply,
        uint256 tokenPrice,
        uint256 royaltyPercentage
    );
    event MemberEditionSet(uint256 tokenId);
    event EditionMinted(address indexed to, uint256 tokenId, uint256 amount);
    event MembershipMinted(address indexed to);
    event ProfileURISet(string newProfileURI);

    constructor(string memory _profileURI) ERC1155(_profileURI) {
        setProfileURI(_profileURI);
        _setURI(0, "");
        _setSupply(0, 10000);
        _setPrice(0, 0);
        _setRoyaltyPercentage(0, 0);
    }

    modifier _isMember() {
        require(
            balanceOf(msg.sender, 0) > 0,
            "Must be a member to mint this edition"
        );
        _;
    }

    function initializeMembership(
        string memory _tokenURI,
        uint256 _tokenSupply,
        uint256 _tokenPrice,
        uint256 _royaltyPercentage
    ) internal onlyOwner {
        _setURI(0, _tokenURI);
        _setSupply(0, _tokenSupply);
        _setPrice(0, _tokenPrice);
        _setRoyaltyPercentage(0, _royaltyPercentage);
        emit MembershipCreated(
            _tokenURI,
            _tokenSupply,
            _tokenPrice,
            _royaltyPercentage
        );
    }

    function createEdition(
        string memory _tokenURI,
        uint256 _tokenSupply,
        uint256 _tokenPrice,
        uint256 _royaltyPercentage,
        bool _setMemberEdition
    ) external onlyOwner {
        uint256 _tokenId = nextTokenId();
        _setURI(_tokenId, _tokenURI);
        _setSupply(_tokenId, _tokenSupply);
        _setPrice(_tokenId, _tokenPrice);
        _setRoyaltyPercentage(_tokenId, _royaltyPercentage);
        if (_setMemberEdition) setMemberEdition(_tokenId);
        emit EditionCreated(
            _tokenId,
            _tokenURI,
            _tokenSupply,
            _tokenPrice,
            _royaltyPercentage
        );
    }

    function setMemberEdition(uint256 _tokenId) internal onlyOwner {
        _isMemberEdition[_tokenId] = true;
        emit MemberEditionSet(_tokenId);
    }

    function _setSupply(uint256 _tokenId, uint256 _tokenSupply) internal {
        _tokenSupplies[_tokenId] = _tokenSupply;
        _tokenCounts[_tokenId] = 0;
    }

    function _setPrice(uint256 _tokenId, uint256 _tokenPrice) internal {
        _tokenPrices[_tokenId] = _tokenPrice;
    }

    function _setRoyaltyPercentage(
        uint256 _tokenId,
        uint256 _royaltyPercentage
    ) internal {
        require(_royaltyPercentage <= 100, "Royalty cannot be more than 100%");
        _tokenRoyalties[_tokenId] = _royaltyPercentage;
    }

    function currentTokenId() public view returns (uint256) {
        return tokenCounter.current();
    }

    function nextTokenId() private returns (uint256) {
        tokenCounter.increment();
        return tokenCounter.current();
    }

    function mintEdition(
        uint256 _tokenId,
        uint256 amount
    ) external payable nonReentrant {
        if (_isMemberEdition[_tokenId]) {
            require(
                balanceOf(msg.sender, 0) > 0,
                "Must be a member to mint this edition"
            );
        }
        require(
            _tokenCounts[_tokenId] + amount <= _tokenSupplies[_tokenId],
            "Exceeding max supply"
        );
        uint256 totalCost = _tokenPrices[_tokenId] * amount;
        require(msg.value == totalCost, "Incorrect amount sent");

        _tokenCounts[_tokenId] += amount;

        _mint(msg.sender, _tokenId, amount, "");

        payable(owner()).sendValue(msg.value);
        emit EditionMinted(msg.sender, _tokenId, amount);
    }

    function mintMembership() external payable nonReentrant {
        require(
            _tokenCounts[0] + 1 <= _tokenSupplies[0],
            "Exceeding max supply"
        );
        uint256 totalCost = _tokenPrices[0];
        require(msg.value == totalCost, "Incorrect amount sent");

        _tokenCounts[0] += 1;

        _mint(msg.sender, 0, 1, "");

        payable(owner()).sendValue(msg.value);
        emit MembershipMinted(msg.sender);
    }

    function setProfileURI(string memory _profileURI) public onlyOwner {
        profileURI = _profileURI;
        emit ProfileURISet(_profileURI);
    }

    receive() external payable {}
}
