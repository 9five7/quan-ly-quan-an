import { ModeToggle } from "@/components/mode-theme";
import Link from "next/link";

export default function Header() {
  return (
    <div>
        <ul>
            <li>
                <Link href='/login'>Đăng Nhập</Link>
            </li>
            <li>
                <Link href='/register'>Đăng Ký</Link>
            </li>
        </ul>
        <ModeToggle/>
    </div>
  )
}
