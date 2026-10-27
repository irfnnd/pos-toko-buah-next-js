import {
  AlphabetIcon,
  HomeIcon,
  InvoiceIcon,
  PieChartIcon,
  TableIcon,
  TaskIcon,
  UserGroupIcon,
  UserIcon,
  Widget4Icon,
} from "./icon";

export interface NavItem {
  title: string;
  url?: string;
  icon?: React.ReactNode;
  items?: NavItem[];
  // Tambahkan properti roles untuk keperluan filter
  roles?: ("ADMIN" | "KASIR")[]; 
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: <HomeIcon />,
        items: [],
        roles: ["ADMIN", "KASIR"],
      },
    ],
  },
  {
    label: "OPERASIONAL TOKO",
    items: [
      {
        title: "User Account",
        url: "/users",
        icon: <UserGroupIcon />,
        items: [],
        roles: ["ADMIN"],
      },
      {
        title: "Data Buah",
        url: "/buah",
        icon: <AlphabetIcon />,
        items: [],
        roles: ["ADMIN"],
      },
      {
        title: "Data Supplier",
        url: "/supplier",
        icon: <UserIcon />,
        items: [],
        roles: ["ADMIN"],
      },
      {
        title: "Data Stok",
        url: "/stok",
        icon: <Widget4Icon />,
        items: [],
        roles: ["ADMIN", "KASIR"],
      },
      {
        title: "Kasir Apps",
        url: "/kasir",
        icon: <TaskIcon />,
        items: [],
        roles: ["ADMIN", "KASIR"],
      },
      {
        title: "Data Transaksi",
        url: "/transaksi",
        icon: <TableIcon />,
        items: [],
        roles: ["ADMIN", "KASIR"],
      },
    ],
  },
  {
    label: "LAPORAN",
    items: [
      {
        title: "Laporan Penjualan",
        url: "/laporan/penjualan",
        icon: <InvoiceIcon />,
        items: [],
        roles: ["ADMIN"],
      },
      {
        title: "Laporan Laba Rugi",
        url: "/laporan/laba-rugi",
        icon: <PieChartIcon />,
        items: [],
        roles: ["ADMIN"],
      },
    ],
  },
];