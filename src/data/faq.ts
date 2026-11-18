export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const faqData: FAQItem[] = [
  {
    id: 'provisional-pricing',
    question: 'Berapakah harga sewa Tong Roro?',
    answer: 'Harga sewa adalah anggaran sementara: RM2XX bagi Tong Roro 2 Feet dan RM3XX–RM4XX bagi Tong Roro 4 Feet untuk tempoh sewaan standard 10 hari (10 days). Caj penghantaran dan kutipan belum disahkan dan tidak termasuk dalam harga yang dipaparkan. Sebut harga rasmi dan muktamad mesti disahkan terus dengan Mr Hari (+60 16-615 9365).',
    category: 'Harga & Bayaran'
  },
  {
    id: 'rental-duration',
    question: 'Berapa lama tempoh sewaan Tong Roro?',
    answer: 'Tempoh sewaan standard ialah 10 hari (10 days). Tempoh ini memberi masa yang mencukupi untuk menguruskan dan memuatkan sisa anda dengan kemas dan selamat. Sebarang kutipan awal atau permohonan lanjutan tempoh boleh diaturkan terus bersama Mr Hari (+60 16-615 9365).',
    category: 'Tempoh Sewaan'
  },
  {
    id: 'sizes-available',
    question: 'Apakah saiz Tong Roro yang tersedia?',
    answer: 'SKL Waste Sdn Bhd menyediakan dua saiz tong utama: Tong Roro 2 Feet dan Tong Roro 4 Feet. Tong 2 Feet (rendah) sesuai untuk sisa kediaman, cantasan taman, ubah suai kecil, serta sisa padat atau berat. Tong 4 Feet (dinding tinggi) direka untuk sisa pembinaan bangunan, sisa perindustrian, perabot pukal, dan pembersihan tapak berskala besar.',
    category: 'Produk'
  },
  {
    id: 'quotation-confirmation',
    question: 'Bagaimana cara membuat tempahan Tong Roro?',
    answer: 'Anda boleh membuat pertanyaan melalui borang sebut harga dalam talian di laman web ini, menghubungi Mr Hari secara terus di +60 16-615 9365, atau menghantar e-mel ke tongroroservissklwaste@gmail.com. Mr Hari akan mengesahkan kesesuaian tapak dan mengeluarkan sebut harga rasmi mengikut keperluan anda.',
    category: 'Tempahan'
  },
  {
    id: 'accepted-waste-types',
    question: 'Apakah jenis sisa yang boleh dimasukkan?',
    answer: 'Tong Roro kami menerima sisa pepejal am berasaskan 9 kategori perkhidmatan yang disahkan: sisa pembinaan, sisa pengubahsuaian, sisa perindustrian, sampah pukal, sisa taman, pembersihan tapak, kutipan sampah, pengangkutan sampah, dan pelupusan sisa. Sila sahkan jenis sisa khusus premis anda bersama Mr Hari (+60 16-615 9365) bagi memastikan kesesuaian pelupusan.',
    category: 'Pengendalian Sisa'
  },
  {
    id: 'delivery-collection-charges',
    question: 'Bagaimana caj penghantaran ditentukan?',
    answer: 'Caj penghantaran dan kutipan belum disahkan dan tidak didakwa termasuk dalam harga anggaran yang dipaparkan. Kos logistik pengangkutan bergantung pada jarak lokasi dari pangkalan kami di Sungai Buloh serta kebolehcapaian lori Roro ke tapak anda, dan akan dinyatakan secara jelas dalam sebut harga oleh Mr Hari (+60 16-615 9365).',
    category: 'Harga & Bayaran'
  },
  {
    id: 'service-areas-verification',
    question: 'Kawasan manakah yang diliputi?',
    answer: 'Kami menyenaraikan 13 kawasan tumpuan di sekitar Sungai Buloh dan Selangor: Desa Coalfields, Bandar Seri Coalfields, Sungai Buloh, Paya Jaras, Bukit Jelutong, Bukit Beruntung, Kundang, Puncak Alam, Aman Putri, Tasik Puteri, Saujana Utama, Subang, dan Rawang. Semua kawasan ini bertaraf Pending Verification di mana ketersediaan operasi dan laluan lori mesti disahkan dengan Mr Hari (+60 16-615 9365).',
    category: 'Kawasan Perkhidmatan'
  },
  {
    id: 'site-preparation',
    question: 'Apa yang perlu disediakan sebelum Tong Roro dihantar?',
    answer: 'Pelanggan perlu memastikan laluan masuk dan tapak letak tong mempunyai ruang yang lapang dan kukuh untuk lori Roro beroperasi, memeriksa kelegaan ketinggian seperti dahan pokok atau kabel, serta mengesahkan titik peletakan tong yang selamat bersama Mr Hari (+60 16-615 9365) sebelum penghantaran.',
    category: 'Operasi & Logistik'
  },
  {
    id: 'whatsapp-status',
    question: 'Bolehkah saya menghubungi SKL Waste melalui WhatsApp?',
    answer: 'Ketersediaan WhatsApp pada nombor +60 16-615 9365 masih dalam status pengesahan (pending confirmation). Untuk maklum balas segera dan pengesahan pesanan rasmi, sila hubungi Mr Hari secara terus melalui panggilan telefon di +60 16-615 9365 atau e-mel ke tongroroservissklwaste@gmail.com.',
    category: 'Hubungan'
  },
  {
    id: 'prohibited-materials',
    question: 'Apakah bahan yang dilarang dimasukkan ke dalam Tong Roro?',
    answer: 'Bahan berbahaya seperti sisa kimia toksik, sisa berjadual, sisa klinikal, bahan mudah terbakar, dan limpahan sisa melebihi paras rim atas tong adalah tidak dibenarkan atas faktor keselamatan pengangkutan jalan raya. Sila hubungi Mr Hari (+60 16-615 9365) untuk sebarang kepastian mengenai bahan buangan anda.',
    category: 'Pengendalian Sisa'
  }
];
