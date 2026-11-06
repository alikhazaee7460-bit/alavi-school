export const SCHOOL = {
  name: 'دبستان دخترانه علوی اسلامی',
  subtitle: 'سامانه ارتباطی مدرسه و خانواده',
  address: 'تهران، خیابان...',
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  email: 'info@alavi-school.ir',
};

export const ASSETS = {
  iranFlag: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Flag_of_Iran.svg',
  portraits: [
    { key: 'imam', label: 'امام خمینی', uri: 'https://placehold.co/120x150/F8B4C4/3D2C3E?text=امام+خمینی' },
    { key: 'khamenei', label: 'آیت‌الله خامنه‌ای', uri: 'https://placehold.co/120x150/C9A8E0/3D2C3E?text=آیت‌الله+خامنه‌ای' },
    { key: 'mojtaba', label: 'آیت‌الله مجتبی خامنه‌ای', uri: 'https://placehold.co/120x150/7DD3C8/3D2C3E?text=آیت‌الله+مجتبی' },
  ],
};

export const QUICK_ACCESS = [
  { key: 'announcements', title: 'اطلاعیه‌ها', icon: 'megaphone', color: '#F8B4C4', route: '/announcements' },
  { key: 'calendar', title: 'تقویم اجرایی', icon: 'calendar', color: '#C9A8E0', route: '/calendar' },
  { key: 'schedule', title: 'برنامه هفتگی', icon: 'time', color: '#7DD3C8', route: '/schedule' },
  { key: 'homework', title: 'تکالیف', icon: 'book', color: '#F5C26B', route: '/homework' },
  { key: 'contact', title: 'ارتباط با مدیریت', icon: 'mail', color: '#8BB8E8', route: '/contact' },
  { key: 'pta', title: 'انجمن اولیا', icon: 'people', color: '#E891A8', route: '/pta' },
  { key: 'feedback', title: 'انتقادات و پیشنهادات', icon: 'chatbubble-ellipses', color: '#A883C7', route: '/feedback' },
  { key: 'surveys', title: 'نظرسنجی‌ها', icon: 'bar-chart', color: '#5BBFB2', route: '/surveys' },
  { key: 'gallery', title: 'گالری', icon: 'images', color: '#F0A5B8', route: '/gallery' },
  { key: 'phone', title: 'تماس با مدرسه', icon: 'call', color: '#7BC67E', route: 'tel:02112345678' },
];