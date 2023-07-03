'use client';

import { Asset, WalletAsset } from "@/app/models";
import { fetcher } from "@/app/utils";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "./flowbite-components";
import Link from "next/link";
import useSWR from "swr";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";

export default function MyWallet(props: { wallet_id: string }) {
  const { data: walletAssets, error, mutate: mutateWalletAssets } = useSWR<WalletAsset[]>(
    `http://localhost:3001/api/wallets/${props.wallet_id}/assets`,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { data: assetChanged } = useSWRSubscription(
    `http://localhost:3000/assets/events`,
    (path, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);
      eventSource.addEventListener("asset-price-changed", async (event) => {
        console.log(event);
        const assetChanged: Asset = JSON.parse(event.data);
        await mutateWalletAssets((prev) => {
          const foundIndex = prev!.findIndex(
            (walletAsset) => walletAsset.asset_id === assetChanged.id
          );

          if (foundIndex !== -1) {
            prev![foundIndex].Asset.price = assetChanged.price;
          }
          console.log(prev);
          return [...prev!];
        }, false);
        next(null, assetChanged);
      });

      eventSource.onerror = (event) => {
        console.error(event);
        eventSource.close();
      };
      return () => {
        console.log("close event source");
        eventSource.close();
      };
    },
    {}
  );

  const { data: walletAssetUpdated } = useSWRSubscription(
    `http://localhost:3000/wallets/${props.wallet_id}/assets/events`,
    (path, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);
      eventSource.addEventListener('wallet-asset-updated', async (event) => {
        const walletAssetUpdated = JSON.parse(event.data);

        await mutateWalletAssets((prev) => {
          const foundIndex = prev?.findIndex(
            walletAsset => walletAsset.asset_id === walletAssetUpdated.asset_id
          );
          if (foundIndex !== -1) {
            prev![foundIndex!].shares = walletAssetUpdated.shares;
          }
          return [...prev!];
        }, false);

        next(null, walletAssetUpdated);
      });

      eventSource.onerror = (error) => {
        console.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  );

  return (
    <Table>
      <TableHead>
        <TableHeadCell className="font-small px-4 py-2">Nome</TableHeadCell>
        <TableHeadCell className="font-small px-4 py-2">Preço R$</TableHeadCell>
        <TableHeadCell className="font-small px-4 py-2">Quant.</TableHeadCell>
        <TableHeadCell className="font-small px-4 py-2">
          <span className="sr-only">Comprar/Vender</span>
        </TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {walletAssets!.map((walletAsset, key) => (
          <TableRow className={`border-gray-700 ${key % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`} key={key}>
            <TableCell className="whitespace-nowrap font-medium text-white px-4 py-2">
              {walletAsset.Asset.id} ({walletAsset.Asset.symbol})
            </TableCell>
            <TableCell className="font-small px-4 py-2">{walletAsset.Asset.price}</TableCell>
            <TableCell className="font-small px-4 py-2">{walletAsset.shares}</TableCell>
            <TableCell className="px-4 py-2">
              <Link
                className="font-medium hover:underline text-cyan-500"
                href={`/${props.wallet_id}/home-broker/${walletAsset.Asset.id}`}
              >
                Comprar/Vender
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}