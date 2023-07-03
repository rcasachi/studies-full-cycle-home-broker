import { AssetChartComponent } from "@/components/AssetChartComponent";
import MyOrders from "@/components/MyOrders";
import OrderForm from "@/components/OrderForm";
import { SyncOrders } from "@/components/SyncOrders";
import { Card, TabsGroup, TabsItem } from "@/components/flowbite-components";
import { HiArrowUp, HiShoppingCart } from "@/components/react-icons/hi";

export default async function HomeBrokerPage({ params }: {
  params: { asset_id: string, wallet_id: string }
}) {
  return (
    <main className="flex flex-grow flex-col container mx-auto">
      <article className="format format-invert my-2">
        <h1>Home broker - {params.asset_id}</h1>
      </article>
      <div className="grid grid-cols-6 flex-grow gap-2 mt-2">
        <div className="col-span-2">
          <div>
            <Card
              theme={{
                root: {
                  children:
                    "flex h-full flex-col justify-center gap-4 py-4 px-2",
                },
              }}
            >
              <TabsGroup aria-label="Default tabs" style="pills">
                <TabsItem active title="Comprar" icon={HiShoppingCart}>
                  <OrderForm
                    wallet_id={params.wallet_id}
                    asset_id={params.asset_id}
                    type="BUY"
                  />
                </TabsItem>
                <TabsItem title="Vender" icon={HiArrowUp}>
                  <OrderForm
                    wallet_id={params.wallet_id}
                    asset_id={params.asset_id}
                    type="SELL"
                  />
                </TabsItem>
              </TabsGroup>
            </Card>
          </div>

          <div className="mt-2">
            <Card
              theme={{
                root: {
                  children:
                    "flex h-full flex-col justify-center gap-4 py-4 px-2",
                },
              }}
            >
              <SyncOrders wallet_id={params.wallet_id}>
                <div className="max-h-96 overflow-y-auto overflow-hidden">
                  <MyOrders wallet_id={params.wallet_id} />
                </div>
              </SyncOrders>
            </Card>
          </div>

        </div>
        <div className="col-span-4 flex flex-grow">
          <AssetChartComponent asset_id={params.asset_id} />
        </div>
      </div>
    </main>
  );
}