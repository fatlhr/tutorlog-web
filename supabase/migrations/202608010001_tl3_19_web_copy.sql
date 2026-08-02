update public.billing_products
set name = 'Paket Free',
    description = 'Catat sesi, periksa rekap, dan susun draft invoice dengan batas ekspor gratis.'
where code = 'free';

update public.billing_products
set name = 'Plus 30 hari',
    description = 'Ekspor rekap tanpa batas dan unduh PDF invoice selama 30 hari.'
where code = 'plus_30d';

update public.billing_products
set name = 'Plus 12 bulan',
    description = 'Ekspor rekap tanpa batas dan unduh PDF invoice selama 12 bulan.'
where code = 'plus_12m';

update public.billing_products
set name = 'Plus selamanya',
    description = 'Ekspor rekap tanpa batas dan unduh PDF invoice selamanya.'
where code = 'plus_lifetime';
