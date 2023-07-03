export type Asset = {
  id: string;
  price: string;
  symbol: string;
}

export type WalletAsset = {
  id: string;
  wallet_id: string;
  asset_id: string;
  shares: string;
  Asset: Asset;
}

export type Order = {
  id: string;
  wallet_id: string;
  asset_id: string;
  shares: string;
  partial: string;
  price: string;
  type: "BUY" | "SELL";
  status: "PENDING" | "OPEN" | "CLOSED" | "FAILED";
  created_at: string;
  updated_at: string;
  Asset: Pick<Asset, "id" | "symbol">;
}

export type AssetDaily = {
  id: string;
  asset_id: string;
  date: string;
  price: number;
};
