export interface NavItem {
  label: string;
  href: string;
}

export const mainNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Tong Roro Rental', href: '/tong-roro-rental' },
  { label: 'Waste Management Services', href: '/waste-management-services' },
  { label: 'Industries We Serve', href: '/industries-we-serve' },
  { label: 'Service Areas', href: '/service-areas' },
  { label: 'Contact Us', href: '/contact-us' }
];

export const footerNavigation: NavItem[] = [
  ...mainNavigation,
  { label: 'Privacy Policy', href: '/privacy-policy' }
];
