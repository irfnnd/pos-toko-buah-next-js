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
      },
      {
        title: "Data Buah",
        url: "/buah",
        icon: <AlphabetIcon />,
        items: [],
      },
      {
        title: "Data Supplier",
        url: "/supplier",
        icon: <UserIcon />,
        items: [],
      },
      {
        title: "Data Stok",
        url: "/stok",
        icon: <Widget4Icon />,
        items: [],
      },
      {
        title: "Kasir Apps",
        url: "/kasir",
        icon: <TaskIcon />,
        items: [],
      },
      {
        title: "Data Transaksi",
        url: "/transaksi",
        icon: <TableIcon />,
        items: [],
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
      },
      {
        title: "Laporan Laba Rugi",
        url: "/laporan/laba-rugi",
        icon: <PieChartIcon />,
        items: [],
      },
    ],
  },
];

