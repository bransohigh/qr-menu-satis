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
export declare const sirket: {
    readonly unvan: string;
    readonly adres: string;
    readonly eposta: string;
    readonly telefon: string;
    readonly vergiDairesi: string;
    readonly vergiNo: string;
    readonly mersis: string;
    readonly kep: string;
    readonly appUrl: string;
    readonly instagram: string;
    readonly twitter: string;
    readonly linkedin: string;
};
//# sourceMappingURL=sirket.d.ts.map