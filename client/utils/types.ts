export type CollectionMetadata = {
  name: string;
  description: string;
  symbol: string;
  image: string;
  base_uri: string;
  seller_fee_basis_points: string;
  fee_recipient: string;
};

export type TokenMetadata = {
  // name: string;
  description: string;
  image: string;
  collection?: string;
  external_url?: string;
  attributes?: Attribute[];
};

export type Attribute = {
  trait_type: string;
  value: string;
};

export const ATTESTATION_STATION = "0xEE36eaaD94d1Cc1d0eccaDb55C38bFfB6Be06C77";
