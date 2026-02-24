"use strict";
/**
 * sirket.ts — Şirket bilgileri merkezi konfigürasyonu
 * Yasal sayfalar, iletişim ve footer için kullanılır.
 * .env veya process.env üzerinden değerleri alır; varsayılan olarak
 * placeholder metinler kullanılır — canlıya geçmeden önce .env'ye ekleyin.
 *
 * .env örneği:
 *   SIRKET_UNVAN="Pixnova Yazılım ve Pazarlama A.Ş."
 *   SIRKET_ADRES="Levent Mah. Cömert Sok. No:5 Kat:3, Beşiktaş / İstanbul"
 *   SIRKET_EPOSTA="destek@qrmenu.com.tr"
 *   SIRKET_TELEFON="+90 212 000 00 00"
 *   SIRKET_VERGI_DAIRESI="Beşiktaş Vergi Dairesi"
 *   SIRKET_VERGI_NO="1234567890"
 *   SIRKET_MERSIS="0123456789000014"
 *   SIRKET_KEP="pixnova@hs01.kep.tr"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sirket = void 0;
exports.sirket = {
    unvan: process.env.SIRKET_UNVAN || 'Piex Creative',
    adres: process.env.SIRKET_ADRES || 'Levent Mah. Cömert Sok. No:5/3, Beşiktaş / İstanbul',
    eposta: process.env.SIRKET_EPOSTA || 'destek@qrmenu.com.tr',
    telefon: process.env.SIRKET_TELEFON || '+90 212 000 00 00',
    vergiDairesi: process.env.SIRKET_VERGI_DAIRESI || 'Beşiktaş Vergi Dairesi',
    vergiNo: process.env.SIRKET_VERGI_NO || '1234567890',
    mersis: process.env.SIRKET_MERSIS || '0123456789000014',
    kep: process.env.SIRKET_KEP || '',
    appUrl: process.env.APP_URL || 'https://qrmenu.com.tr',
    instagram: process.env.SIRKET_INSTAGRAM || 'https://instagram.com/qrmenu.tr',
    twitter: process.env.SIRKET_TWITTER || 'https://twitter.com/qrmenutr',
    linkedin: process.env.SIRKET_LINKEDIN || 'https://linkedin.com/company/qrmenu-tr',
};
//# sourceMappingURL=sirket.js.map