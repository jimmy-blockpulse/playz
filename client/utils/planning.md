USER:
- _ID = profile address
- EOA = address
- image
- username
- full name
- followers
- following

VIDEO:
- _ID = profile address : token ID
- url
- thumbnail
- token id
- owner: EOA
- profile
- description
- supply
- price
- royalty
- member edition

MEMBERSHIP:
- _ID = profile address : 0
- url
- thumbnail
- token id 0
- owner: EOA
- profile
- description
- supply
- price
- royalty


/users/:profile
- query profile by EOA when my profile page
- returns thumbnail by profile
- clicking on one goes to feed with that video as index 0

/feed/:profile
- returns video by profile

/feed/:profile/:id?
- how can you share a single video?

/
- returns random videos from DB

search bar with autocomplete
- query user profile by username

profile page has purchased section
profile page also has liked section
integrate messaging + livestreaming

view token on block explorer

view your purchase history?
view your balance, like a personal dashboard of sorts would be cool to have

