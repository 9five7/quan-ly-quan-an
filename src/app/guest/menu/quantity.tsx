import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'
export default function Quantity({ onChange, value }: { onChange: (value: number) => void; value: number }) {
  return (
    <div className='flex gap-1 '>
      <Button className='h-6 w-6 p-0' disabled={value === 0} onClick={() => onChange(value - 1)}>
        <Minus className='w-3 h-3' />
      </Button>
      <Input
        type='text'
        inputMode='numeric' // trên điện thoại hiện phím số
        pattern='[0-9]*'
        value={value}
        onChange={(e) => {
          const value = e.target.value
          const numberValue = Number(value)
          if (Number.isNaN(numberValue)) return
          onChange(numberValue)
        }}
        className='h-6 p-1 w-8 text-center'
      />
      <Button className='h-6 w-6 p-0' onClick={() => onChange(value + 1)}>
        <Plus className='w-3 h-3' />
      </Button>
    </div>
  )
}
