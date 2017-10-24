# Dashboard

Pasar Virtual Kota Payakumbuh: Subsistem Analisis Data and Visualisasi
***Aplikasi dapat diakses pada alamat 167.205.35.43:8000** (menggunakan VPN ke network ITB)

# Instalasi
1. ```sh
    $ git clone http://gitlab.informatika.org/pasar-virtual/dashboard.git
    $ composer install
   ```
2. Pastikan database sudah di-migrate menggunakan *database migration* pada aplikasi pasar tradisional dan marketplace
3. Lakukan konfigurasi aplikasi melalui file **.env**
4. ```$ php artisan serve ```

# API
Hasil analisis data dapat diakses melalui API yang tersedia. Parameter query yang dapat digunakan antara lain, (tergantung *endpoint*, untuk lebih jelas lihat contoh)

| Parameter    | Keterangan     |
| -------------|:-------------:|
| type         | tipe analisis data (**stats, toplist, list, history, city**) |
| start_date   | tanggal awal (format: **YYYY-MM-DD**) |
| end_date     | tanggal akhir   |
| sort         | data terurut menaik / menurun (**highest** / **lowest**) |
| sentra_id    | ID sentra (numerik: **1,2,3,..**)

## Pasar Tradisional
***Source code dapat diakses pada** ```app/Http/Controllers/VirtualMarketController.php```

API endpoints:
- ### **```/api/virtualmarket/transaction```**

    Contoh: `http://167.205.35.43:8000/api/virtualmarket/transaction?type=stats&start_date=2017-09-25&end_date=2017-10-24`

- ### **```/api/virtualmarket/product```**

    Contoh: `http://167.205.35.43:8000/api/virtualmarket/product?type=stats&start_date=2017-09-25&end_date=2017-10-24`
    
- ### **```/api/virtualmarket/shopper```**
     
    Contoh:     `http://167.205.35.43:8000/api/virtualmarket/shopper?type=list&start_date=2017-09-25&end_date=2017-10-24&sort=highest`
    
- ### **```/api/virtualmarket/feedback```**

    Contoh: `http://167.205.35.43:8000/api/virtualmarket/feedback?type=stats&start_date=2017-09-25&end_date=2017-10-24`
    
- ### **```/api/virtualmarket/buyer```**

    Contoh:    `http://167.205.35.43:8000/api/virtualmarket/buyer?type=stats&start_date=2017-09-25&end_date=2017-10-24`

## Marketplace
***Source code dapat diakses pada** ```/app/Http/Controllers/MarketplaceController.php```
- ### **```/api/marketplace/transaction```**
    
    Contoh: `http://167.205.35.43:8000/api/marketplace/transaction?type=stats&start_date=2017-09-25&end_date=2017-10-24`
    
- ### **```/api/marketplace/product```**
    
    Contoh: `http://167.205.35.43:8000/api/marketplace/sentra?type=toplist&start_date=2017-09-25&end_date=2017-10-24`
- ### **```/api/marketplace/sentra```**

    Contoh: `http://167.205.35.43:8000/api/marketplace/sentra?type=data&start_date=2017-09-25&end_date=2017-10-24&sentra_id=1`
    
- ### **```/api/marketplace/feedback```**

    Contoh: `http://167.205.35.43:8000/api/marketplace/feedback?type=stats&start_date=2017-09-25&end_date=2017-10-24`
- ### **```/api/marketplace/buyer```**

    Contoh: `http://167.205.35.43:8000/api/marketplace/buyer?type=history&start_date=2017-09-25&end_date=2017-10-24`

# Frontend
***Source code dapat diakses pada folder** ```/public/dashboard/app/pages```
Setiap folder berisi source code untuk menu aplikasi yang bersangkutan, misal: source code untuk dashboard pasar tradisional terletak pada folder ```/public/dashboard/app/pages/virtualmarket```

# Cara Penggunaan

1. Akses **167.205.35.43:8000** pada browser Anda
2. Login (akses default menggunakan data berikut)
   ```sh
   email: disperindag@gmail.com
   password: 12345
   ```
3. Pilih salah satu dashboard yang tersedia (**Pasar Tradisional, Operasional, atau Marketplace**)
4. Untuk mengelola produk pasar tradisional dapat memilih menu **Kelola Produk**
5. Untuk mengelola koefisien tarif layanan garendong, dapat memilih menu **Kelola Tarif**
6. Untuk menambah, mengubah, dan menghapus pengguna aplikasi, dapat memilih menu **Kelola Pengguna**

# Lainnya
Analisis data menggunakan beberapa rumus / perhitungan / algoritma berikut.
1. **Fluktuasi Harga**
    
    $$Fluktuasi = {\sum_{i=1}^n \Biggl({H_i - H_i'\over H_i} \Biggr) \over n} * 100\% $$
    
    Keterangan:
    $H_i$ = Harga rata-rata produk ke-$i$ pada periode waktu yang dipilih
    $H_i'$ = Harga rata-rata produk ke-$i$ pada periode sebelumnya
    $n$ = Banyaknya produk
    
2. **Prediksi Permintaan dan Harga**

    Prediksi jumlah permintaan / harga suatu produk menggunakan *linear regression*. *Training set* yang diambil adalah data produk 30 hari terakhir, kemudian digunakan untuk memprediksi jumlah permintaan / harga untuk 3 hari ke depan.
    Library yang digunakan: https://php-ml.readthedocs.io/en/latest/machine-learning/regression/least-squares/
    
3. **Rating**
    
    Rating dihitung sebagai rata-rata menggunakan rumus berikut.
    
    $$rating = {\sum_{i=1}^n ( R_i ) \over n}$$
    
    Keterangan:
    $R_i$ = Rating yang diberikan untuk pesanan ke-$i$ pada periode waktu yang dipilih
    $n$ = Banyaknya rating yang diberikan
  
