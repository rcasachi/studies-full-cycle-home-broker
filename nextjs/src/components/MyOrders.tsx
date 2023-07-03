import { Order } from "@/app/models";
import { isHomeBrokerClosed } from "@/app/utils";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "./flowbite-components";

async function getOrders(wallet_id: string): Promise<Order[]> {
  const response = await fetch(`http://host.docker.internal:3000/wallets/${wallet_id}/orders`, {
    next: { tags: [`orders-wallet-${wallet_id}`], revalidate: isHomeBrokerClosed() ? 60 * 60 : 5 }
  });
  return response.json();
}

export default async function MyOrders(props: { wallet_id: string }) {
  const orders = await getOrders(props.wallet_id);

  return (
    <div>
      <article className="format format-invert">
        <h2>Minha ordens</h2>
      </article>
      <Table className="mt-2">
        <TableHead>
          <TableHeadCell className="font-small px-4">asset_id</TableHeadCell>
          <TableHeadCell className="font-small px-4">quant.</TableHeadCell>
          <TableHeadCell className="font-small px-4">price</TableHeadCell>
          <TableHeadCell className="font-small">tipo</TableHeadCell>
          <TableHeadCell className="font-small">status</TableHeadCell>
        </TableHead>
        <TableBody>
          {orders.map((order, key) => (
            <TableRow
              className={`border-gray-700 ${key % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}
              key={key}
            >
              <TableCell className="whitespace-nowrap font-small text-white px-4 py-2">
                {order.Asset.id}
              </TableCell>
              <TableCell className="font-small px-4 py-2">{order.shares}</TableCell>
              <TableCell className="font-small px-4 py-2">{order.price}</TableCell>
              <TableCell className="px-4 py-2 text-center">
                <Badge color={order.type === 'BUY' ? 'green' : 'pink'} className="inline">
                  {order.type}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-2 text-center">
                <Badge color="indigo" className="inline">{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}