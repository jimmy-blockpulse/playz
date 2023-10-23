# PlayzProfile Smart Contract

## Overview

The `PlayzProfile` contract is designed for the Playz app, offering functionalities for creating, managing, and minting unique NFT editions and membership tokens. It inherits properties from the OpenZeppelin library, particularly the ERC1155 standard.

## Features

- **ERC1155URIStorage**: Incorporates the storage functionalities of the ERC1155 token standard with URI management.
  
- **Ownable**: Restricts certain functionalities (like creating an edition or setting the profile URI) to the owner of the contract.

- **ReentrancyGuard**: Ensures that certain methods can't be called multiple times before the initial call finishes, mitigating reentrancy attacks.

- **Counter**: An OpenZeppelin utility to manage incremental counters, in this case, used for generating new token IDs.

## Key Variables and Mappings

- `profileURI`: A string that defines the profile's URI.
  
- `tokenCounter`: Keeps track of the token IDs.
  
- `_tokenSupplies`, `_tokenCounts`, `_tokenPrices`, `_tokenRoyalties`, `_isMemberEdition`: Mappings to store various attributes of tokens, such as their supply count, price, and whether they're a member edition.

## Events

- **EditionCreated**: Emitted when a new edition is created.
  
- **MembershipCreated**: Emitted when a membership is created.
  
- **MemberEditionSet**: Emitted when an edition is set as a member edition.
  
- **EditionMinted**: Emitted when an edition is minted.
  
- **MembershipMinted**: Emitted when a membership is minted.
  
- **ProfileURISet**: Emitted when the profile URI is set or updated.

## Key Functions

- **createMembership**: Allows the owner to create a membership token.
  
- **createEdition**: Allows the owner to create a new edition.
  
- **setMemberEdition**: Allows the owner to mark an edition as a "member edition".
  
- **mintEdition**: Allows users to mint editions by sending the appropriate amount of ETH.
  
- **mintMembership**: Allows users to mint membership tokens.

- **setProfileURI**: Allows the owner to set or update the profile URI.
  
## Modifiers

- `_isMember`: Checks if the caller is a member before allowing certain actions.

## Security

The contract includes a `receive()` function that allows it to accept Ether. Functions like `mintEdition` and `mintMembership` require payment in ETH, and these amounts are directly forwarded to the owner's address.

## Dependencies

The contract imports multiple libraries from OpenZeppelin, such as `ERC1155URIStorage`, `Ownable`, `Counters`, `Address`, and `ReentrancyGuard`.

---

**Note**: Before deploying or integrating with this contract, consider reviewing and testing the contract thoroughly. Ensure you understand the functionalities provided, especially if integrating with production applications.
