export type User = {
  _id: string; // profile address
  address: string; // EOA address
  username: string;
  image: string; // URL of profile image
  name: string;
  followers: { [address: string]: boolean }; // follower address => T/F
  following: { [address: string]: boolean }; // follower address => T/F
};

export type Edition = {
  _id: string; // format: <PROFILE_ADDRESS>:<TOKEN_ID>
  url: string; // content URL
  thumbnail: string; // thumbnail URL
  tokenId: string;
  creator: string; // EOA of owner
  creatorProfile: string; // profile address of owner
  description: string;
  supply: number;
  price: number;
  royalty: number;
  isMemberEdition: boolean;
  likes: { [address: string]: boolean };
  comments: { [address: string]: string };
};
