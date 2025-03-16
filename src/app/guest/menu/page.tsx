import MenuOrders from '@/app/guest/menu/menu-orders'

export default async function menuPage() {
  return (
    <div className='max-w-[400px] mx-auto space-y-4'>
      <h1 className='text-center text-xl font-bold'>🍕 Menu quán</h1>
      <MenuOrders />
    </div>
  )
}
