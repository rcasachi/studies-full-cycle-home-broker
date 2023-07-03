import { revalidateTag } from "next/cache";
import { Button, Label, TextInput } from '@/components/flowbite-components'

async function initTransaction(formData: FormData) {
  'use server';
  const shares = formData.get('shares');
  const price = formData.get('price');
  const asset_id = formData.get('asset_id');
  const wallet_id = formData.get('wallet_id');
  const type = formData.get('type');

  const response = await fetch(`http://host.docker.internal:3000/wallets/${wallet_id}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      asset_id,
      type,
      shares,
      price,
    }),
  })

  revalidateTag(`orders-wallet-${wallet_id}`)
  return await response.json();
}

export default function OrderForm(props: {
  asset_id: string,
  wallet_id: string,
  type: 'BUY' | 'SELL'
}) {
  return (
    <div>
      <form action={initTransaction}>
        <input type="hidden" name="asset_id" defaultValue={props.asset_id} />
        <input type="hidden" name="wallet_id" defaultValue={props.wallet_id} />
        <input type="hidden" name="type" defaultValue={props.type} />

        <div>
          <div className="mb-2 block">
            <Label htmlFor="shares" value="Quantidade" />
          </div>
          <TextInput
            id="shares"
            name="shares"
            required
            type="number"
            min={1}
            step={1}
            defaultValue={1}
          />
        </div>
        <br />

        <div>
          <div className="mb-2 block">
            <Label htmlFor="shares" value="Preço R$" />
          </div>
          <TextInput
            id="price"
            name="price"
            required
            type="number"
            min={1}
            step={1}
            defaultValue={1}
          />
        </div>
        <br />

        <Button type="submit" color={props.type === "BUY" ? "green" : "red"} className="w-full">
          Confirmar {props.type === "BUY" ? "compra" : "venda"}
        </Button>
      </form>
    </div>
  );
}