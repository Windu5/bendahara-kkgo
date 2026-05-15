<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bendahara App | Modern System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Standar CSS Khusus untuk Mode Cetak (Print) */
        @media screen {
            .print-only { display: none !important; }
        }
        @media print {
            .print-only { display: block !important; }
            
            /* PENGHANCUR MUTLAK: Memaksa Form & UI hilang dengan prioritas tertinggi */
            html body .no-print, 
            html body .print\:hidden { 
                display: none !important; 
                opacity: 0 !important;
                visibility: hidden !important;
                height: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
            
            @page {
                size: portrait;
                margin: 1.5cm;
            }
            
            /* PENGHANCUR KOTAK ABU-ABU: Memaksa seluruh kanvas kertas menjadi putih bersih */
            body, html, main, .bg-gray-50, .min-h-screen, .h-screen { 
                background-color: white !important; 
                height: auto !important; 
            }
            
            /* Membuka kunci tinggi layar agar bisa multi-halaman */
            .h-screen, .min-h-screen {
                height: auto !important;
                min-height: auto !important;
            }
            /* Mengizinkan konten meluber ke halaman baru */
            .overflow-hidden {
                overflow: visible !important;
            }
            header, nav { 
                display: none !important; 
            }
            main { 
                padding: 0 !important; 
                margin: 0 !important; 
                overflow: visible !important; 
                max-width: 100% !important;
                height: auto !important;
            }
            * { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
                box-shadow: none !important; /* Mencegah shadow bocor saat dicetak */
                text-shadow: none !important; /* Mencegah efek bayangan pada teks */
            }
            .overflow-y-auto { overflow: visible !important; max-height: none !important; }
            
            /* Mencegah baris tabel terpotong setengah di antara dua kertas */
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
        }

        /* Skeleton Loading Animation */
        @keyframes skeleton-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
        }
        .skeleton {
            background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
            background-size: 200% 100%;
            animation: skeleton-shimmer 1.5s ease-in-out infinite;
            border-radius: 6px;
        }
        @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    </style>

    <!-- PWA Setup: Manifest & Meta Tags (Standar Mobile Experience) -->
    <link rel="manifest" href="./manifest.json">
    <meta name="theme-color" content="#2563EB">
    <link rel="apple-touch-icon" href="./icon-192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</head>
<body class="bg-gray-50 text-gray-900">

    <!-- EVENT LISTENER GLOBAL UNTUK GANTI TAB -->
    <div x-data="authApp" @change-tab.window="if(user) { document.querySelector('[x-data*=activeTab]').__x.$data.activeTab = $event.detail; }" class="min-h-screen flex flex-col">
        
        <!-- MODERN DIALOG (GLOBAL MODAL) -->
        <div x-data="modernDialog" 
             @show-alert.window="showAlert($event.detail)"
             @show-confirm.window="showConfirm($event.detail)"
             x-show="isOpen" 
             class="fixed inset-0 z-[300] flex items-center justify-center p-4 print:hidden" style="display: none;">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="close()" x-show="isOpen" x-transition.opacity.duration.300ms></div>
            
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-2xl z-10 w-full max-w-sm transform will-change-transform"
                 x-show="isOpen"
                 x-transition:enter="ease-out duration-300 transform-gpu" x-transition:enter-start="opacity-0 scale-95 translate-y-4" x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                 x-transition:leave="ease-in duration-200 transform-gpu" x-transition:leave-start="opacity-100 scale-100 translate-y-0" x-transition:leave-end="opacity-0 scale-95 translate-y-4">
                
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                         :class="type === 'confirm' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'">
                        <svg x-show="type === 'alert'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <svg x-show="type === 'confirm'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900" x-text="title"></h3>
                </div>
                
                <div class="text-sm text-gray-600 mb-8 whitespace-pre-line leading-relaxed font-medium" x-text="message"></div>
                
                <div class="flex gap-3 justify-end">
                    <button x-show="type === 'confirm'" @click="close()" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition">Batal</button>
                    <button @click="confirm()" class="flex-1 px-4 py-2.5 text-white font-bold rounded-xl active:scale-95 transition shadow-md"
                            :class="type === 'confirm' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'"
                            x-text="type === 'confirm' ? 'Ya, Lanjutkan' : 'Mengerti'"></button>
                </div>
            </div>
        </div>

        <!-- LOADING STATE -->
        <div x-show="loading" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center print:hidden">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>

        <!-- LOGIN PAGE -->
        <template x-if="!user">
            <div class="flex-grow flex items-center justify-center p-4 print:hidden">
                <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                    <h2 class="text-2xl font-bold mb-6 text-center text-blue-600">Login Bendahara</h2>

                    <div x-show="errorMessage" x-text="errorMessage" x-transition 
                         class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg text-center" style="display: none;">
                    </div>

                    <form @submit.prevent="login()">
                        <div class="mb-4 hidden">
                            <label class="block text-sm font-medium mb-1">Email</label>
                            <input type="email" x-model="formData.email" required
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-1">Password</label>
                            <input type="password" x-model="formData.password" required autofocus
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <button type="submit" 
                            class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                            Masuk ke Sistem
                        </button>
                    </form>
                </div>
            </div>
        </template>

        <!-- DASHBOARD -->
        <template x-if="user">
            <div x-data="{ activeTab: 'kas', showActionMenu: false }" class="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
                
                <!-- ACTION MENU POPUP -->
                <div x-show="showActionMenu" class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 pb-24 px-4 print:hidden" style="display: none;">
                    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="showActionMenu = false" x-show="showActionMenu" x-transition.opacity.duration.300ms></div>
                    
                    <div class="bg-white rounded-3xl p-6 shadow-2xl z-10 w-full max-w-sm transform will-change-transform"
                         x-show="showActionMenu"
                         x-transition:enter="ease-out duration-300 transform-gpu" x-transition:enter-start="opacity-0 translate-y-full" x-transition:enter-end="opacity-100 translate-y-0"
                         x-transition:leave="ease-in duration-200 transform-gpu" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 translate-y-full">
                        
                        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer sm:hidden" @click="showActionMenu = false"></div>
                        <h3 class="text-lg font-bold text-gray-800 mb-5 px-1">Pilih Aksi Tambah Data</h3>
                        
                        <div class="space-y-3">
                            <button @click="showActionMenu = false; activeTab = 'iuran'; setTimeout(() => $dispatch('open-add-iuran'), 150);" class="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-2xl transition-all group text-left">
                                <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                </div>
                                <div>
                                    <div class="font-bold text-gray-800 text-[15px]">1. Input Data Sekolah</div>
                                    <div class="text-xs text-gray-500 mt-0.5">Tambah daftar sekolah & nama penyetor</div>
                                </div>
                            </button>

                            <button @click="showActionMenu = false; activeTab = 'iuran'; setTimeout(() => $dispatch('open-pembayaran-iuran'), 150);" class="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-100 rounded-2xl transition-all group text-left relative overflow-hidden">
                                <div class="absolute right-0 top-0 w-2 h-full bg-green-500"></div>
                                <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <div class="font-bold text-gray-800 text-[15px]">2. Input Iuran Sekolah</div>
                                    <div class="text-xs text-green-600 font-semibold mt-0.5">+ Update Otomatis ke BKU</div>
                                </div>
                            </button>

                            <button @click="showActionMenu = false; activeTab = 'kas'; setTimeout(() => $dispatch('open-add-modal'), 150);" class="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-2xl transition-all group text-left">
                                <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <div>
                                    <div class="font-bold text-gray-800 text-[15px]">3. Catat Transaksi BKU</div>
                                    <div class="text-xs text-gray-500 mt-0.5">Input Pemasukan / Pengeluaran lain</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 1. TOP NAVIGATION DESKTOP -->
                <header class="print:hidden hidden md:block bg-white w-full border-b border-gray-200 z-40 px-8 pt-5 shrink-0">
                    <div class="flex justify-between items-center mb-6 max-w-7xl mx-auto">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <div class="flex flex-col">
                                <h1 class="font-bold text-xl text-blue-700 leading-tight">KKGO Digital</h1>
                                <p class="text-xs text-gray-500"></p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="text-sm text-gray-500 flex items-center gap-1">
                                User: <span class="bg-gray-50 text-gray-600 font-mono px-2 py-1 rounded text-xs border border-gray-100" x-text="user.email"></span>
                            </div>
                            <button @click="logout()" class="p-1.5 text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors active:scale-95" title="Keluar">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        </div>
                    </div>

                    <nav class="flex gap-8 max-w-7xl mx-auto">
                        <button @click="activeTab = 'home'" :class="activeTab === 'home' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'" class="flex items-center gap-2 pb-3 transition-colors text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            Beranda
                        </button>
                        <button @click="activeTab = 'kas'" :class="activeTab === 'kas' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'" class="flex items-center gap-2 pb-3 transition-colors text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            Buku Kas
                        </button>
                        <button @click="activeTab = 'iuran'" :class="activeTab === 'iuran' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'" class="flex items-center gap-2 pb-3 transition-colors text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Data Iuran
                        </button>
                        <button @click="activeTab = 'setting'" :class="activeTab === 'setting' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'" class="flex items-center gap-2 pb-3 transition-colors text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Pengaturan
                        </button>
                    </nav>
                </header>

                <!-- 1.1 MOBILE TOP NAVIGATION -->
                <header class="print:hidden md:hidden w-full bg-white z-40 border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <div class="flex flex-col">
                            <h1 class="font-bold text-[16px] text-gray-900 leading-tight">KKGO Digital</h1>
                            <p class="text-[11px] text-gray-500 leading-none mt-0.5">Kelompok Kerja Guru Olahraga</p>
                        </div>
                    </div>
                    <button @click="logout()" class="p-1.5 text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors active:scale-95 shrink-0" title="Keluar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </header>

                <!-- 2. MOBILE BOTTOM NAVIGATION -->
                <nav class="print:hidden md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-between items-center px-2 pb-3 pt-2 z-[60] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                    <button @click="activeTab = 'home'" class="flex flex-col items-center gap-1 w-1/5" :class="activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span class="text-[10px] font-medium">Home</span>
                    </button>
                    
                    <button @click="activeTab = 'kas'" class="flex flex-col items-center gap-1 w-1/5" :class="activeTab === 'kas' ? 'text-blue-600' : 'text-gray-400'">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <span class="text-[10px] font-medium">Kas</span>
                    </button>

                    <div class="relative w-1/5 flex justify-center">
                        <button @click="showActionMenu = true" 
                            class="absolute -top-7 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,0.5)] hover:bg-blue-700 active:scale-95 transition-all duration-200 z-50">
                            <svg class="w-8 h-8 transition-transform duration-300" :class="showActionMenu ? 'rotate-45' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>

                    <button @click="activeTab = 'iuran'" class="flex flex-col items-center gap-1 w-1/5" :class="activeTab === 'iuran' ? 'text-blue-600' : 'text-gray-400'">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        <span class="text-[10px] font-medium">Iuran</span>
                    </button>

                    <button @click="activeTab = 'setting'" class="flex flex-col items-center gap-1 w-1/5" :class="activeTab === 'setting' ? 'text-blue-600' : 'text-gray-400'">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span class="text-[10px] font-medium">Setting</span>
                    </button>
                </nav>

                <!-- 3. MAIN CONTENT AREA -->
                <main class="flex-1 w-full p-4 md:p-8 pb-28 md:pb-8 max-w-7xl mx-auto overflow-y-auto">
                    
                    <!-- TAB: HOME -->
                    <template x-if="activeTab === 'home'">
                        <div x-transition.opacity class="p-4 md:p-8">
                            <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard Ringkasan</h2>
                            <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm text-center">
                                <h3 class="text-lg font-medium text-blue-800">Selamat datang di KKGO Digital</h3>
                                <p class="text-sm text-blue-600 mt-2">Sementara Zonk.</p>
                            </div>
                        </div>
                    </template>

                    <!-- TAB: KAS (Pemasukan & Pengeluaran) -->
                    <template x-if="activeTab === 'kas'">
                        <div x-data="bkuApp" @open-add-modal.window="openAddModal()" x-transition.opacity>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 md:pb-0">
                                
                                <!-- AREA BACKDROP MODAL TRANSAKSI -->
                                <div x-show="isTransactionModalOpen" 
                                     x-transition.opacity.duration.300ms 
                                     class="no-print md:hidden fixed inset-0 bg-gray-900/60 z-[60]"
                                     @click="isTransactionModalOpen = false" style="display: none;"></div>

                                <!-- FORM INPUT MODAL/KOLOM (BKU) -->
                                <div x-show="isTransactionModalOpen"
                                     x-transition:enter="ease-out duration-300 transform-gpu"
                                     x-transition:enter-start="opacity-0 scale-95 translate-y-8"
                                     x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                                     x-transition:leave="ease-in duration-200 transform-gpu"
                                     x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                                     x-transition:leave-end="opacity-0 scale-95 translate-y-8"
                                     class="no-print print:hidden fixed inset-x-4 bottom-4 z-[70] md:inset-x-0 md:bottom-auto md:z-auto bg-white p-6 md:pb-6 rounded-[32px] md:rounded-2xl shadow-2xl md:shadow-sm border border-gray-100 md:border-t md:!block md:!transform-none md:!transition-none md:!opacity-100 md:static lg:col-span-1 max-h-[85vh] overflow-y-auto will-change-transform"
                                     style="display: none;">
                                    
                                    <div class="md:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5 cursor-pointer" @click="isTransactionModalOpen = false"></div>
                                    
                                    <div class="flex justify-between items-center mb-4">
                                        <h2 class="text-lg font-bold text-gray-800" x-text="editId ? 'Edit Transaksi' : 'Catat Transaksi'"></h2>
                                        <button type="button" @click="isTransactionModalOpen = false" class="md:hidden p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full active:scale-95 transition">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    
                                    <form @submit.prevent="submitTransaction()">
                                        <div class="mb-4 flex gap-4 p-1 bg-gray-100 rounded-lg">
                                            <label class="flex-1 text-center cursor-pointer">
                                                <input type="radio" x-model="form.type" value="income" class="peer sr-only">
                                                <div class="py-2 rounded-md text-sm font-medium transition-all peer-checked:bg-white peer-checked:text-green-600 peer-checked:shadow-sm text-gray-500">Pemasukan</div>
                                            </label>
                                            <label class="flex-1 text-center cursor-pointer">
                                                <input type="radio" x-model="form.type" value="expense" class="peer sr-only">
                                                <div class="py-2 rounded-md text-sm font-medium transition-all peer-checked:bg-white peer-checked:text-red-600 peer-checked:shadow-sm text-gray-500">Pengeluaran</div>
                                            </label>
                                        </div>

                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-xs font-semibold mb-1 text-gray-500 uppercase">Tanggal</label>
                                                <input type="date" x-model="form.date" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all">
                                            </div>

                                            <div>
                                                <label class="block text-xs font-semibold mb-1 text-gray-500 uppercase">Kategori</label>
                                                <select x-model="form.category" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all">
                                                    <option value="" disabled>Pilih Kategori...</option>
                                                    <option value="Konsumsi">Konsumsi</option>
                                                    <option value="Narasumber">Narasumber</option>
                                                    <option value="ATK">ATK</option>
                                                    <option value="Sumbangan">Sumbangan</option>
                                                    <option value="Lainnya">Lain-lain</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label class="block text-xs font-semibold mb-1 text-gray-500 uppercase">Uraian / Keterangan</label>
                                                <textarea x-model="form.description" required rows="2" placeholder="Contoh: Beli alat tulis kantor" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all"></textarea>
                                            </div>

                                            <div>
                                                <label class="block text-xs font-semibold mb-1 text-gray-500 uppercase">Jumlah (Rp)</label>
                                                <input type="number" id="jumlahInput" x-model="form.amount" required min="1" placeholder="50000" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-lg font-semibold transition-all">
                                            </div>
                                        </div>

                                        <button type="submit" :disabled="isSubmitting" class="w-full mt-6 bg-blue-600 text-white py-3 md:py-3 py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                            <span x-show="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            <span x-text="isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'"></span>
                                        </button>
                                    </form>
                                </div>

                                <!-- AREA RIWAYAT BKU (TAMPILAN DAFTAR TRANSAKSI) -->
                                <div class="lg:col-span-2 flex-1">
                                    
                                    <!-- FORMAT CETAK BKU STANDAR -->
                                    <div class="print-only w-full bg-white pb-6">
                                        <div class="mb-4 text-center leading-tight">
                                            <h2 class="text-lg font-bold text-black uppercase tracking-wide">Laporan Buku Kas Umum (BKU)</h2>
                                            <h3 class="text-[15px] font-bold text-black uppercase mt-0.5">Kelompok Kerja Guru Olahraga (KKGO)</h3>
                                            <h3 class="text-[15px] font-bold text-black uppercase mt-0.5">Kecamatan Nanga Mahap</h3>
                                            <p class="text-black font-semibold mt-1.5 text-sm italic" x-text="'Periode Bulan: ' + formatBulanTahun(selectedMonth)"></p>
                                        </div>
                                        
                                        <table class="w-full border-collapse border border-black text-black mt-2">
                                            <thead>
                                                <tr class="text-[11px] bg-gray-50">
                                                    <th class="border border-black py-1 px-1.5 text-center w-8">NO</th>
                                                    <th class="border border-black py-1 px-1.5 text-center w-20">TGL</th>
                                                    <th class="border border-black py-1 px-1.5 text-center">URAIAN</th>
                                                    <th class="border border-black py-1 px-1.5 text-center w-24">PEMASUKAN</th>
                                                    <th class="border border-black py-1 px-1.5 text-center w-24">PENGELUARAN</th>
                                                    <th class="border border-black py-1 px-1.5 text-center w-28">SALDO</th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-[11px]">
                                                <!-- Baris Cetak Saldo Pindahan Jika Ada -->
                                                <template x-if="saldoPindahan !== 0 || transactions.length > 0">
                                                    <tr class="bg-gray-100 font-semibold" x-show="saldoPindahan !== 0">
                                                        <td class="border border-black py-1 px-1.5 text-center">-</td>
                                                        <td class="border border-black py-1 px-1.5 text-center">-</td>
                                                        <td class="border border-black py-1 px-1.5">SALDO PINDAHAN BULAN SEBELUMNYA</td>
                                                        <td class="border border-black py-1 px-1.5 text-right" x-text="saldoPindahan > 0 ? formatRupiah(saldoPindahan) : '-'"></td>
                                                        <td class="border border-black py-1 px-1.5 text-right" x-text="saldoPindahan < 0 ? formatRupiah(Math.abs(saldoPindahan)) : '-'"></td>
                                                        <td class="border border-black py-1 px-1.5 text-right font-bold" x-text="formatRupiah(saldoPindahan)"></td>
                                                    </tr>
                                                </template>

                                                <template x-for="(trx, index) in processedTransactions" :key="trx.id">
                                                    <tr>
                                                        <td class="border border-black py-1 px-1.5 text-center" x-text="index + 1"></td>
                                                        <td class="border border-black py-1 px-1.5 text-center" x-text="trx.date.substring(8, 10) + '/' + trx.date.substring(5, 7) + '/' + trx.date.substring(0, 4)"></td>
                                                        <td class="border border-black py-1 px-1.5 leading-tight" x-text="trx.description"></td>
                                                        <td class="border border-black py-1 px-1.5 text-right whitespace-nowrap" x-text="trx.type === 'income' ? formatRupiah(trx.amount) : '-'"></td>
                                                        <td class="border border-black py-1 px-1.5 text-right whitespace-nowrap" x-text="trx.type === 'expense' ? formatRupiah(trx.amount) : '-'"></td>
                                                        <td class="border border-black py-1 px-1.5 text-right font-bold whitespace-nowrap" x-text="formatRupiah(trx.saldo)"></td>
                                                    </tr>
                                                </template>

                                                <template x-if="processedTransactions.length === 0 && saldoPindahan === 0">
                                                    <tr>
                                                        <td colspan="6" class="border border-black p-3 text-center italic text-gray-500">Tidak ada transaksi pada bulan ini.</td>
                                                    </tr>
                                                </template>
                                            </tbody>
                                        </table>

                                        <!-- Ringkasan dan Tanda Tangan Cetak BKU -->
                                        <div class="mt-8 flex justify-between items-end text-black w-full" style="page-break-inside: avoid;">
                                            <!-- Kiri: Ringkasan Total Cetak -->
                                            <div class="w-72 text-[12px]">
                                                <table class="w-full">
                                                    <tr>
                                                        <td class="font-semibold py-1">Total Pemasukan</td>
                                                        <td class="py-1 w-4 text-center">:</td>
                                                        <td class="font-semibold py-1 text-right" x-text="formatRupiah(totalIncome + (saldoPindahan > 0 ? saldoPindahan : 0))"></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="font-semibold py-1">Total Pengeluaran</td>
                                                        <td class="py-1 w-4 text-center">:</td>
                                                        <td class="font-semibold py-1 text-right" x-text="formatRupiah(totalExpense + (saldoPindahan < 0 ? Math.abs(saldoPindahan) : 0))"></td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="3" class="border-b border-black"></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="font-bold py-1">Sisa Kas / Total</td>
                                                        <td class="py-1 w-4 text-center">:</td>
                                                        <td class="font-bold py-1 text-right" x-text="formatRupiah(saldoPindahan + totalIncome - totalExpense)"></td>
                                                    </tr>
                                                </table>
                                            </div>

                                            <!-- Kanan: Tanda Tangan -->
                                            <div class="text-center w-56 text-[12px]">
                                                <p>Bendahara</p>
                                                <div class="h-16 flex items-center justify-center text-gray-400 italic">
                                                    Ttd
                                                </div>
                                                <p class="font-bold underline">Tika Zinawati, S.Pd</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- TAMPILAN LAYAR APLIKASI (BKU Card) -->
                                    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col no-print print:hidden overflow-hidden relative border-none print:border-none print:shadow-none">
                                        
                                        <!-- Header Daftar Transaksi & Filter Bulan -->
                                        <div class="sticky top-0 z-30 px-4 md:px-6 border-b border-gray-200 bg-white/95 backdrop-blur-md">
                                            <div class="h-16 md:h-20 flex justify-between items-center">
                                                <h3 class="font-bold text-gray-800 text-base md:text-xl">Riwayat BKU</h3>
                                                
                                                <div class="flex items-center gap-2.5">
                                                    <input type="month" x-model="selectedMonth" @change="fetchTransactions()" 
                                                        class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-200 rounded-lg bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold shadow-sm">
                                                    
                                                    <button @click="window.print()" class="px-3 py-1.5 md:px-4 md:py-2 text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95 flex items-center gap-2 shadow-sm" title="Cetak Laporan">
                                                        <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                                        <span class="hidden md:inline text-sm md:text-base font-bold">Cetak</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <!-- Search Bar -->
                                            <div class="pb-3">
                                                <div class="relative">
                                                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                                    <input type="text" x-model="searchQuery" placeholder="Cari nama sekolah..." 
                                                        class="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                                                    <button x-show="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Konten Daftar Transaksi -->
                                        <div class="bg-gray-50/30 pb-2 min-h-[250px]">
                                            <div x-show="isLoadingData" class="p-2 print:hidden">
                                                <table class="w-full text-left border-collapse">
                                                    <thead class="bg-gray-50/95 border-b border-gray-200">
                                                        <tr class="text-[9px] md:text-[11px] text-gray-400 uppercase tracking-wider">
                                                            <th class="px-2 py-2 w-8"><div class="skeleton h-3 w-6 mx-auto"></div></th>
                                                            <th class="px-2 py-2 w-12 md:w-16"><div class="skeleton h-3 w-8"></div></th>
                                                            <th class="px-2 py-2"><div class="skeleton h-3 w-14"></div></th>
                                                            <th class="px-2 py-2 text-right"><div class="skeleton h-3 w-16 ml-auto"></div></th>
                                                            <th class="px-2 py-2 w-14"><div class="skeleton h-3 w-8 mx-auto"></div></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-gray-100 bg-white">
                                                        <template x-for="i in 5" :key="i">
                                                            <tr>
                                                                <td class="px-2 py-3 text-center"><div class="skeleton h-3 w-4 mx-auto"></div></td>
                                                                <td class="px-2 py-3"><div class="skeleton h-3 w-10"></div></td>
                                                                <td class="px-2 py-3">
                                                                    <div class="skeleton h-4 w-3/4 mb-1.5"></div>
                                                                    <div class="skeleton h-2.5 w-1/2"></div>
                                                                </td>
                                                                <td class="px-2 py-3 text-right"><div class="skeleton h-4 w-16 ml-auto"></div></td>
                                                                <td class="px-2 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded-full"></div></td>
                                                            </tr>
                                                        </template>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <template x-if="!isLoadingData && transactions.length === 0 && saldoPindahan === 0">
                                                <div class="flex flex-col items-center justify-center p-12 text-gray-400 print:hidden">
                                                    <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                                    <p class="font-medium text-gray-500 text-sm md:text-base">Tidak ada transaksi bulan ini</p>
                                                    <p class="text-xs md:text-sm mt-1">Silakan input melalui form Catat Transaksi</p>
                                                </div>
                                            </template>

                                            <!-- Tampilkan Tabel Jika ada Transaksi ATAU ada Saldo Pindahan -->
                                            <template x-if="!isLoadingData && (transactions.length > 0 || saldoPindahan !== 0)">
                                                <table class="w-full text-left border-collapse">
                                                    <thead class="sticky top-16 md:top-20 z-20 bg-gray-50/95 backdrop-blur-md border-b border-gray-200">
                                                        <tr class="text-[9px] md:text-[11px] text-gray-500 uppercase tracking-wider">
                                                            <th class="px-2 py-2 font-semibold text-center w-8">No</th>
                                                            <th class="px-2 py-2 font-semibold w-12 md:w-16">Tgl</th>
                                                            <th class="px-2 py-2 font-semibold">Uraian</th>
                                                            <th class="px-2 py-2 font-semibold text-right">Nominal</th>
                                                            <th class="px-2 py-2 font-semibold text-center w-14 print:hidden">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-gray-100 bg-white">
                                                        <!-- Baris Saldo Pindahan di UI (Dinamis) -->
                                                        <tr class="bg-blue-50/40 hover:bg-blue-50/70 transition-colors" x-show="saldoPindahan !== 0">
                                                            <td class="px-1 py-3 align-top text-center"><div class="text-[10px] md:text-[11px] font-bold text-blue-400 mt-1">-</div></td>
                                                            <td class="px-2 py-3 align-top"><div class="text-[10px] md:text-[11px] font-bold text-blue-400 mt-1">-</div></td>
                                                            <td class="px-2 py-3.5 align-top">
                                                                <div class="text-xs md:text-sm font-bold text-blue-800 leading-tight">Saldo Pindahan Bulan Sebelumnya</div>
                                                                <div class="text-[9px] md:text-[10px] text-blue-500 font-semibold mt-0.5">SISA KAS LALU</div>
                                                            </td>
                                                            <td class="px-2 py-3 align-top text-right whitespace-nowrap">
                                                                <div class="text-[11px] md:text-[12px] font-extrabold mt-1 text-blue-700" x-text="formatRupiah(saldoPindahan)"></div>
                                                            </td>
                                                            <td class="px-2 py-3 align-top text-center print:hidden"></td>
                                                        </tr>

                                                        <template x-for="(trx, index) in filteredTransactions" :key="trx.id">
                                                            <tr class="hover:bg-gray-50/80 transition-colors">
                                                                <td class="px-1 py-2 align-top text-center"><div class="text-[10px] md:text-[11px] font-semibold text-gray-500 mt-1" x-text="index + 1"></div></td>
                                                                <td class="px-2 py-2 align-top"><div class="text-[10px] md:text-[11px] font-semibold text-gray-500 mt-1" x-text="trx.date.substring(8, 10) + '/' + trx.date.substring(5, 7)"></div></td>
                                                                <td class="px-2 py-2.5 align-top">
                                                                    <div class="text-xs md:text-sm font-bold text-gray-800 leading-tight break-words" x-text="trx.description"></div>
                                                                    <div class="text-[9px] md:text-[10px] text-gray-400 font-semibold uppercase mt-0.5" x-text="trx.category"></div>
                                                                </td>
                                                                <td class="px-2 py-2 align-top text-right whitespace-nowrap">
                                                                    <div class="text-[11px] md:text-[12px] font-extrabold mt-1" :class="trx.type === 'income' ? 'text-green-600' : 'text-red-600'">
                                                                        <span x-text="trx.type === 'income' ? '+' : '-'"></span>
                                                                        <span x-text="formatRupiah(trx.amount)"></span>
                                                                    </div>
                                                                </td>
                                                                <td class="px-2 py-2 align-top text-center whitespace-nowrap print:hidden">
                                                                    <div class="flex items-center justify-center gap-1.5 mt-0.5">
                                                                        <button @click="editTransaction(trx)" class="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 md:p-1.5 rounded transition active:scale-95" title="Edit">
                                                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                                        </button>
                                                                        <button @click="executeDeleteTransaction(trx.id)" class="text-red-500 hover:text-red-700 bg-red-50 p-1 md:p-1.5 rounded transition active:scale-95" title="Hapus">
                                                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </template>
                                                    </tbody>
                                                </table>
                                            </template>
                                        </div>

                                        <div class="p-3 md:p-4 bg-white border-t border-gray-200 shrink-0 relative z-30">
                                            <!-- Ringkasan Saldo Tampil Jika Ada -->
                                            <div class="flex justify-between items-center mb-1.5" x-show="saldoPindahan !== 0">
                                                <span class="text-[10px] md:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Saldo Bulan Lalu</span>
                                                <span class="text-[11px] md:text-xs font-extrabold text-blue-600" x-text="formatRupiah(saldoPindahan)"></span>
                                            </div>
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-[10px] md:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pemasukan Bulan Ini</span>
                                                <span class="text-[11px] md:text-xs font-extrabold text-green-600" x-text="'+ ' + formatRupiah(totalIncome)"></span>
                                            </div>
                                            <div class="flex justify-between items-center mb-1.5">
                                                <span class="text-[10px] md:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
                                                <span class="text-[11px] md:text-xs font-extrabold text-red-600" x-text="'- ' + formatRupiah(totalExpense)"></span>
                                            </div>
                                            <div class="h-px w-full bg-gray-200 my-1.5 md:my-2"></div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-xs md:text-sm font-bold text-gray-800">Sisa Kas Total</span>
                                                <!-- MATEMATIKA FINAL: Saldo Pindahan + Pemasukan - Pengeluaran -->
                                                <span class="text-sm md:text-base font-black text-blue-700" x-text="formatRupiah(saldoPindahan + totalIncome - totalExpense)"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- TAB: IURAN (DATA IURAN SEKOLAH) -->
                    <template x-if="activeTab === 'iuran'">
                        <div x-data="iuranApp" @open-add-iuran.window="openModal()" @open-pembayaran-iuran.window="openPembayaranModal()" x-transition.opacity class="pb-24 md:pb-0">
                            
                            <!-- MODAL 1: Form Tambah/Edit Data Sekolah -->
                            <div x-show="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden" style="display: none;">
                                <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal()" x-show="isModalOpen" x-transition.opacity.duration.300ms></div>
                                <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative z-10 transform will-change-transform"
                                     x-show="isModalOpen"
                                     x-transition:enter="ease-out duration-300 transform-gpu" x-transition:enter-start="opacity-0 scale-95 translate-y-4" x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                                     x-transition:leave="ease-in duration-200 transform-gpu" x-transition:leave-start="opacity-100 scale-100 translate-y-0" x-transition:leave-end="opacity-0 scale-95 translate-y-4">
                                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 class="font-bold text-lg text-gray-800" x-text="editId ? 'Edit Data Sekolah' : 'Tambah Data Sekolah'"></h3>
                                        <button type="button" @click="closeModal()" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                    </div>
                                    <form @submit.prevent="submitData()" class="p-6">
                                        <div class="mb-4">
                                            <label class="block text-sm font-semibold text-gray-600 mb-1">Nama Sekolah</label>
                                            <input type="text" x-model="form.nama_sekolah" required placeholder="Cth: SDN 1 Merdeka" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        </div>
                                        <div class="mb-6">
                                            <label class="block text-sm font-semibold text-gray-600 mb-1">Nama Guru (Penyetor)</label>
                                            <input type="text" x-model="form.nama_guru" required placeholder="Cth: Budi Santoso" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        </div>
                                        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition" x-text="editId ? 'Simpan Perubahan' : 'Simpan Data Baru'"></button>
                                    </form>
                                </div>
                            </div>

                            <!-- MODAL 2: Form Input Iuran (Dual Update: Iuran + BKU) -->
                            <div x-show="isPembayaranModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4 print:hidden" style="display: none;">
                                <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closePembayaranModal()" x-show="isPembayaranModalOpen" x-transition.opacity.duration.300ms></div>
                                <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative z-10 transform will-change-transform"
                                     x-show="isPembayaranModalOpen"
                                     x-transition:enter="ease-out duration-300 transform-gpu" x-transition:enter-start="opacity-0 scale-95 translate-y-4" x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                                     x-transition:leave="ease-in duration-200 transform-gpu" x-transition:leave-start="opacity-100 scale-100 translate-y-0" x-transition:leave-end="opacity-0 scale-95 translate-y-4">
                                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                            <h3 class="font-bold text-lg text-gray-800">Catat Iuran Masuk</h3>
                                        </div>
                                        <button type="button" @click="closePembayaranModal()" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                    </div>
                                    <form @submit.prevent="submitPembayaranIuran()" class="p-6">
                                        <div class="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg border border-blue-100 mb-5 flex gap-2 items-start">
                                            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <p>Jika nominal diisi lebih dari 0, otomatis masuk ke Buku Kas (BKU). Jika 0, hanya akan mencentang tabel Iuran.</p>
                                        </div>

                                        <div class="mb-4">
                                            <label class="block text-sm font-semibold text-gray-600 mb-1">Sekolah Penyetor</label>
                                            <select x-model="formPembayaran.sekolah_id" @change="autoSelectPertemuan()" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all">
                                                <option value="" disabled>-- Pilih Sekolah --</option>
                                                <template x-for="sekolah in iuranList" :key="sekolah.id">
                                                    <option :value="sekolah.id" x-text="sekolah.nama_sekolah + ' (' + sekolah.nama_guru + ')'"></option>
                                                </template>
                                            </select>
                                        </div>
                                        
                                        <div class="mb-4">
                                            <label class="block text-sm font-semibold text-gray-600 mb-2">Pertemuan Ke-</label>
                                            <div class="grid grid-cols-7 gap-2">
                                                <template x-for="p in ['p1','p2','p3','p4','p5','p6']" :key="p">
                                                    <label class="text-center relative group" :class="isPertemuanPaid(formPembayaran.sekolah_id, p) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'">
                                                        <input type="radio" name="pertemuan" :value="p" x-model="formPembayaran.pertemuan" class="peer sr-only" :disabled="isPertemuanPaid(formPembayaran.sekolah_id, p)">
                                                        <div class="px-0 py-2 border border-gray-200 rounded-lg text-[13px] font-bold uppercase transition-all peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 peer-checked:shadow text-gray-500 bg-gray-50 peer-disabled:bg-gray-200 peer-disabled:text-gray-400 group-hover:not(.peer-disabled):bg-gray-100" x-text="p"></div>
                                                    </label>
                                                </template>
                                                <label class="text-center relative group cursor-pointer">
                                                    <input type="radio" name="pertemuan" value="skip" x-model="formPembayaran.pertemuan" class="peer sr-only">
                                                    <div class="px-0 py-2 border border-gray-200 rounded-lg text-[13px] font-bold transition-all peer-checked:bg-gray-500 peer-checked:text-white peer-checked:border-gray-500 peer-checked:shadow text-gray-500 bg-gray-50 group-hover:bg-gray-100">-</div>
                                                </label>
                                            </div>
                                            <p x-show="formPembayaran.sekolah_id && !formPembayaran.pertemuan" class="text-xs text-red-500 mt-1">Semua pertemuan sudah lunas dibayar.</p>
                                        </div>

                                        <div class="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-600 mb-1">Tanggal</label>
                                                <input type="date" x-model="formPembayaran.tanggal" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-600 mb-1">Nominal (Rp)</label>
                                                <input type="number" x-model="formPembayaran.nominal" required min="0" class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-base transition-all bg-gray-50 text-gray-900 focus:bg-white">
                                            </div>
                                        </div>

                                        <button type="submit" :disabled="isSubmittingForm" class="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-500/30 flex justify-center items-center gap-2">
                                            <span x-show="isSubmittingForm" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            <span x-text="isSubmittingForm ? 'Memproses...' : 'Simpan Pembayaran Iuran'"></span>
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <!-- FORMAT CETAK IURAN STANDAR -->
                            <div class="print-only w-full bg-white pb-6">
                                <div class="mb-4 text-center leading-tight">
                                    <h2 class="text-lg font-bold text-black uppercase tracking-wide">Laporan Daftar Iuran Sekolah</h2>
                                    <h3 class="text-[15px] font-bold text-black uppercase mt-0.5">Kelompok Kerja Guru Olahraga (KKGO)</h3>
                                    <h3 class="text-[15px] font-bold text-black uppercase mt-0.5">Kecamatan Nanga Mahap</h3>
                                    <p class="text-black font-semibold mt-1.5 text-sm italic">Rekapitulasi Pembayaran Pertemuan</p>
                                </div>
                                
                                <table class="w-full border-collapse border border-black text-black mt-2">
                                    <thead>
                                        <tr class="text-[11px] bg-gray-50">
                                            <th class="border border-black py-1 px-1.5 text-center w-8">NO</th>
                                            <th class="border border-black py-1 px-1.5 text-left">NAMA SEKOLAH</th>
                                            <th class="border border-black py-1 px-1.5 text-center w-10">P1</th>
                                            <th class="border border-black py-1 px-1.5 text-center w-10">P2</th>
                                            <th class="border border-black py-1 px-1.5 text-center w-10">P3</th>
                                            <th class="border border-black py-1 px-1.5 text-center w-10">P4</th>
                                            <th class="border border-black py-1 px-1.5 text-center w-10">P5</th>
                                            <th class="border border-black py-1 px-1.5 text-center w-10">P6</th>
                                            <th class="border border-black py-1 px-1.5 text-right w-24">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-[11px]">
                                        <template x-for="(item, index) in iuranList" :key="item.id">
                                            <tr>
                                                <td class="border border-black py-1 px-1.5 text-center align-top" x-text="index + 1"></td>
                                                <td class="border border-black py-1 px-1.5 align-top font-bold uppercase" x-text="item.nama_sekolah"></td>
                                                <td class="border border-black py-1 px-1.5 text-center align-top text-sm font-bold" x-text="item.p1 === 'skip' ? '-' : (item.p1 ? '✓' : '')"></td>
                                                <td class="border border-black py-1 px-1.5 text-center align-top text-sm font-bold" x-text="item.p2 === 'skip' ? '-' : (item.p2 ? '✓' : '')"></td>
                                                <td class="border border-black py-1 px-1.5 text-center align-top text-sm font-bold" x-text="item.p3 === 'skip' ? '-' : (item.p3 ? '✓' : '')"></td>
                                                <td class="border border-black py-1 px-1.5 text-center align-top text-sm font-bold" x-text="item.p4 === 'skip' ? '-' : (item.p4 ? '✓' : '')"></td>
                                                <td class="border border-black py-1 px-1.5 text-center align-top text-sm font-bold" x-text="item.p5 === 'skip' ? '-' : (item.p5 ? '✓' : '')"></td>
                                                <td class="border border-black py-1 px-1.5 text-center align-top text-sm font-bold" x-text="item.p6 === 'skip' ? '-' : (item.p6 ? '✓' : '')"></td>
                                                <td class="border border-black py-1 px-1.5 text-right align-top font-bold" x-text="hitungTotal(item)"></td>
                                            </tr>
                                        </template>
                                        <template x-if="iuranList.length === 0">
                                            <tr>
                                                <td colspan="9" class="border border-black p-3 text-center italic text-gray-500">Belum ada data sekolah.</td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>

                                <!-- Kolom Tanda Tangan Cetak Iuran -->
                                <div class="mt-8 flex justify-end text-black w-full" style="page-break-inside: avoid;">
                                    <div class="text-center w-56 text-[12px]">
                                        <p>Bendahara</p>
                                        <div class="h-16 flex items-center justify-center text-gray-400 italic">
                                            Ttd
                                        </div>
                                        <p class="font-bold underline">Tika Zinawati, S.Pd</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Data Iuran -->
                            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col no-print print:hidden overflow-hidden relative min-h-[300px] border-none print:border-none print:shadow-none">
                                
                                <div class="sticky top-0 z-30 h-16 md:h-20 px-4 md:px-6 border-b border-gray-200 flex justify-between items-center bg-white/95 backdrop-blur-md">
                                    <h3 class="font-bold text-gray-800 text-base md:text-xl">Data Iuran Sekolah</h3>
                                    <div class="flex items-center gap-2.5 print:hidden">
                                        <button @click="window.print()" class="px-3 py-1.5 md:px-4 md:py-2 text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95 flex items-center gap-2 shadow-sm" title="Cetak Data Iuran">
                                            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                            <span class="hidden md:inline text-sm md:text-base font-bold">Cetak</span>
                                        </button>
                                        <button type="button" @click="openModal()" class="hidden md:flex bg-blue-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm md:text-base font-bold hover:bg-blue-700 transition items-center gap-1.5 shadow-sm shadow-blue-500/30">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                            Tambah Sekolah
                                        </button>
                                    </div>
                                </div>

                                <div class="overflow-x-auto flex-1 bg-gray-50/30">
                                    <div x-show="isLoading" class="p-2 print:hidden">
                                        <table class="w-full text-left border-collapse min-w-[500px] md:min-w-[800px]">
                                            <thead class="bg-gray-100 border-b border-gray-200">
                                                <tr class="text-[9px] md:text-[11px] text-gray-400 uppercase tracking-wider">
                                                    <th class="px-2 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-2 py-2 min-w-[120px]"><div class="skeleton h-3 w-20"></div></th>
                                                    <th class="px-1 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-1 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-1 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-1 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-1 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-1 py-2 w-8"><div class="skeleton h-3 w-5 mx-auto"></div></th>
                                                    <th class="px-2 py-2 min-w-[80px]"><div class="skeleton h-3 w-12 ml-auto"></div></th>
                                                    <th class="px-2 py-2 w-14"><div class="skeleton h-3 w-8 mx-auto"></div></th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-100 bg-white">
                                                <template x-for="i in 5" :key="i">
                                                    <tr>
                                                        <td class="px-2 py-3 text-center"><div class="skeleton h-3 w-4 mx-auto"></div></td>
                                                        <td class="px-2 py-3">
                                                            <div class="skeleton h-3.5 w-24 mb-1.5"></div>
                                                            <div class="skeleton h-2.5 w-16"></div>
                                                        </td>
                                                        <td class="px-1 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded"></div></td>
                                                        <td class="px-1 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded"></div></td>
                                                        <td class="px-1 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded"></div></td>
                                                        <td class="px-1 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded"></div></td>
                                                        <td class="px-1 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded"></div></td>
                                                        <td class="px-1 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded"></div></td>
                                                        <td class="px-2 py-3 text-right"><div class="skeleton h-3.5 w-14 ml-auto"></div></td>
                                                        <td class="px-2 py-3 text-center"><div class="skeleton h-5 w-5 mx-auto rounded-full"></div></td>
                                                    </tr>
                                                </template>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <table x-show="!isLoading" class="w-full text-left border-collapse min-w-[500px] md:min-w-[800px]">
                                        <thead class="bg-gray-100 border-b border-gray-200">
                                            <tr class="text-[9px] md:text-[11px] text-gray-500 uppercase tracking-wider">
                                                <th class="px-2 py-2 font-semibold text-center w-8">No</th>
                                                <th class="px-2 py-2 font-semibold min-w-[120px]">Sekolah & Penyetor</th>
                                                <th class="px-1 py-2 font-semibold text-center w-8">P1</th>
                                                <th class="px-1 py-2 font-semibold text-center w-8">P2</th>
                                                <th class="px-1 py-2 font-semibold text-center w-8">P3</th>
                                                <th class="px-1 py-2 font-semibold text-center w-8">P4</th>
                                                <th class="px-1 py-2 font-semibold text-center w-8">P5</th>
                                                <th class="px-1 py-2 font-semibold text-center w-8">P6</th>
                                                <th class="px-2 py-2 font-semibold text-right min-w-[80px]">Total</th>
                                                <th class="px-2 py-2 font-semibold text-center w-14 print:hidden">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-100 bg-white">
                                            <template x-for="(item, index) in iuranList" :key="item.id">
                                                <tr class="hover:bg-gray-50/80 transition-colors">
                                                    <td class="px-1 py-2 align-top text-center"><div class="text-[10px] md:text-[11px] font-semibold text-gray-500 mt-1" x-text="index + 1"></div></td>
                                                    <td class="px-2 py-2 align-top">
                                                        <div class="text-[11px] md:text-sm font-bold text-gray-800 leading-tight break-words" x-text="item.nama_sekolah"></div>
                                                        <div class="text-[9px] md:text-[10px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                                                            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                            <span x-text="item.nama_guru"></span>
                                                        </div>
                                                    </td>
                                                    <template x-for="p in ['p1','p2','p3','p4','p5','p6']" :key="p">
                                                        <td class="px-1 py-2 align-top text-center">
                                                            <button type="button" @click="handleIuranClick(item, p, item[p])" 
                                                                class="w-5 h-5 mx-auto rounded flex items-center justify-center transition-all shadow-sm active:scale-90 mt-1"
                                                                :class="item[p] === 'skip' ? 'bg-gray-400 text-white' : (item[p] ? 'bg-green-500 text-white' : 'bg-gray-100 border border-gray-200 text-gray-300 hover:bg-gray-200')">
                                                                <svg x-show="item[p] && item[p] !== 'skip'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                                                <span x-show="item[p] === 'skip'" class="text-[10px] font-bold">-</span>
                                                            </button>
                                                        </td>
                                                    </template>
                                                    <td class="px-2 py-2 align-top text-right whitespace-nowrap"><div class="text-[11px] md:text-[12px] font-extrabold text-blue-600 mt-1" x-text="hitungTotal(item)"></div></td>
                                                    <td class="px-2 py-2 align-top text-center whitespace-nowrap print:hidden">
                                                        <div class="flex items-center justify-center gap-1 mt-0.5">
                                                            <button type="button" @click="executeEditData(item)" class="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 md:p-1.5 rounded transition active:scale-95" title="Edit"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                                            <button type="button" @click="executeDeleteData(item.id)" class="text-red-500 hover:text-red-700 bg-red-50 p-1 md:p-1.5 rounded transition active:scale-95" title="Hapus"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </template>
                                            <tr x-show="iuranList.length === 0">
                                                <td colspan="10" class="text-center py-8 text-gray-400 italic text-xs">Belum ada data sekolah yang diinput.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- TAB: SETTING -->
                    <template x-if="activeTab === 'setting'">
                        <div x-data="settingApp" x-transition.opacity class="p-4 md:p-8 space-y-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-6">Pengaturan Sistem</h2>

                            <!-- PENGATURAN IURAN (GLOBAL STATE) -->
                            <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Besaran Iuran Bulanan
                                </h3>
                                <p class="text-sm text-gray-600 mb-4">Atur nominal default yang muncul saat mencatat iuran sekolah.</p>
                                <div class="flex flex-col sm:flex-row items-end gap-4 max-w-sm">
                                    <div class="flex-1 w-full">
                                        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Nominal (Rp)</label>
                                        <input type="number" x-model="$store.config.nominalIuran" min="0" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-lg transition-all">
                                    </div>
                                    <button @click="saveConfig()" class="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-500/30 whitespace-nowrap">
                                        Simpan Nominal
                                    </button>
                                </div>
                            </div>

                            <!-- Danger Zone -->
                            <div class="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
                                <h3 class="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Zona Berbahaya (Danger Zone)
                                </h3>
                                <p class="text-sm text-gray-600 mb-4">Tindakan di bawah ini akan mengubah data secara massal dan tidak dapat dibatalkan.</p>

                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div>
                                        <div class="font-bold text-red-800">Reset Ceklis Iuran</div>
                                        <div class="text-xs text-red-600 mt-0.5">Menghapus seluruh status pembayaran (P1-P6) menjadi Belum Bayar.</div>
                                    </div>
                                    <button @click="resetIuran()" :disabled="isResetting" class="shrink-0 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                        <span x-show="isResetting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" style="display: none;"></span>
                                        <span x-text="isResetting ? 'Memproses...' : 'Reset Data Iuran'"></span>
                                    </button>
                                </div>

                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-xl border border-red-100 mt-4">
                                    <div>
                                        <div class="font-bold text-red-800">Kosongkan Riwayat BKU</div>
                                        <div class="text-xs text-red-600 mt-0.5">Menghapus SELURUH data transaksi pemasukan & pengeluaran dari database.</div>
                                    </div>
                                    <button @click="resetBKU()" :disabled="isResettingBKU" class="shrink-0 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                        <span x-show="isResettingBKU" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" style="display: none;"></span>
                                        <span x-text="isResettingBKU ? 'Memproses...' : 'Hapus Semua BKU'"></span>
                                    </button>
                                </div>
                            </div>

                            <!-- Akun -->
                            <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Akun Pengguna
                                </h3>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium text-gray-800" x-text="user.email"></div>
                                        <div class="text-xs text-gray-500 mt-0.5">Administrator</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </main>
            </div>
        </template>
    </div>

    <script type="module">
        import Alpine from "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.js";
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
        import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCsgM8CK9-_WhFuQr-xe7FkL_kB6qRR2RQ",
            authDomain: "bendahara-kkgo.firebaseapp.com",
            projectId: "bendahara-kkgo",
            storageBucket: "bendahara-kkgo.firebasestorage.app",
            messagingSenderId: "847848326395",
            appId: "1:847848326395:web:afe250017943fa03b1dc5e"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        const FinanceService = {
            async addTransaction(data, userUid) {
                if (data.amount <= 0) throw new Error("Jumlah harus lebih dari 0");
                const monthString = data.date.substring(0, 7);
                const payload = {
                    type: data.type,
                    amount: Number(data.amount),
                    category: data.category,
                    description: data.description,
                    date: data.date, 
                    month: monthString, 
                    source: 'manual',
                    closed: false,
                    createdAt: serverTimestamp(),
                    createdBy: userUid
                };

                if (data.related_sekolah_id) payload.related_sekolah_id = data.related_sekolah_id;
                if (data.related_pertemuan) payload.related_pertemuan = data.related_pertemuan;

                return await addDoc(collection(db, "transactions"), payload);
            },
            async updateTransaction(id, data) {
                if (data.amount <= 0) throw new Error("Jumlah harus lebih dari 0");
                const monthString = data.date.substring(0, 7);
                const payload = { type: data.type, amount: Number(data.amount), category: data.category, description: data.description, date: data.date, month: monthString };
                return await updateDoc(doc(db, "transactions", id), payload);
            },
            async deleteTransaction(id) { 
                return await deleteDoc(doc(db, "transactions", id)); 
            },
            async deleteTransactionByDescription(descText) {
                const q = query(collection(db, "transactions"), where("description", "==", descText));
                const snapshot = await getDocs(q);
                if (snapshot.empty) return;

                const batch = writeBatch(db);
                snapshot.forEach((docSnap) => {
                    const docRef = doc(db, "transactions", docSnap.id);
                    batch.delete(docRef);
                });
                return await batch.commit(); 
            },
            async deleteAllTransactions() {
                const q = query(collection(db, "transactions"));
                const snapshot = await getDocs(q);
                if (snapshot.empty) return;

                const batches = [];
                let batch = writeBatch(db);
                let count = 0;

                snapshot.forEach((docSnap) => {
                    batch.delete(doc(db, "transactions", docSnap.id));
                    count++;
                    if (count === 490) {
                        batches.push(batch.commit());
                        batch = writeBatch(db);
                        count = 0;
                    }
                });
                
                if (count > 0) {
                    batches.push(batch.commit());
                }
                
                return await Promise.all(batches);
            },
            
            async getPreviousBalance(selectedMonthString) {
                const q = query(collection(db, "transactions"), where("month", "<", selectedMonthString));
                const snapshot = await getDocs(q);
                
                let previousBalance = 0;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.type === 'income') {
                        previousBalance += Number(data.amount);
                    } else if (data.type === 'expense') {
                        previousBalance -= Number(data.amount);
                    }
                });
                
                return previousBalance;
            },

            listenTransactions(monthString, callback) {
                const q = query(collection(db, "transactions"), where("month", "==", monthString));
                return onSnapshot(q, (snapshot) => {
                    const data = []; snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
                    data.sort((a, b) => {
                        const dateDiff = new Date(a.date) - new Date(b.date);
                        if (dateDiff !== 0) return dateDiff;
                        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                        return timeA - timeB;
                    });
                    callback(data, null); 
                }, (error) => callback([], error));
            }
        };

        const IuranService = {
            async addIuran(data) {
                const payload = { ...data, p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, createdAt: serverTimestamp() };
                return await addDoc(collection(db, "iuran_sekolah"), payload);
            },
            async updateIuran(id, data) { return await updateDoc(doc(db, "iuran_sekolah", id), data); },
            async deleteIuran(id) { return await deleteDoc(doc(db, "iuran_sekolah", id)); },
            listenIuran(callback) {
                const q = query(collection(db, "iuran_sekolah"), orderBy("createdAt", "asc"));
                return onSnapshot(q, (snapshot) => {
                    const data = []; snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
                    callback(data);
                });
            },
            async resetSemuaIuran() {
                const q = query(collection(db, "iuran_sekolah"));
                const snapshot = await getDocs(q);
                if (snapshot.empty) return;

                const batch = writeBatch(db);
                snapshot.forEach((docSnap) => {
                    const docRef = doc(db, "iuran_sekolah", docSnap.id);
                    batch.update(docRef, { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false });
                });
                return await batch.commit();
            }
        };

        document.addEventListener('alpine:init', () => {

            Alpine.store('config', {
                nominalIuran: 50000,
                init() {
                    const saved = localStorage.getItem('kkgo_nominal_iuran');
                    if (saved) {
                        this.nominalIuran = Number(saved);
                    }
                },
                saveConfig() {
                    localStorage.setItem('kkgo_nominal_iuran', this.nominalIuran);
                }
            });
            
            Alpine.data('modernDialog', () => ({
                isOpen: false, type: 'alert', title: '', message: '', confirmCallback: null,
                showAlert({title, message}) {
                    this.type = 'alert'; this.title = title || 'Informasi'; this.message = message; this.isOpen = true;
                },
                showConfirm({title, message, onConfirm}) {
                    this.type = 'confirm'; this.title = title || 'Konfirmasi'; this.message = message; this.confirmCallback = onConfirm; this.isOpen = true;
                },
                close() { this.isOpen = false; this.confirmCallback = null; },
                confirm() { if (this.confirmCallback) this.confirmCallback(); this.close(); }
            }));

            Alpine.data('authApp', () => ({
                user: null, loading: true, errorMessage: '', formData: { email: 'windusapto5@gmail.com', password: '' },
                init() { onAuthStateChanged(auth, (user) => { this.user = user; this.loading = false; }); },
                async login() {
                    this.loading = true; this.errorMessage = '';
                    try { await signInWithEmailAndPassword(auth, this.formData.email, this.formData.password); this.formData = { email: '', password: '' }; } 
                    catch (error) { this.errorMessage = "Login gagal. Periksa kembali kredensial Anda."; } 
                    finally { this.loading = false; }
                },
                async logout() { this.loading = true; try { await signOut(auth); } finally { this.loading = false; } }
            }));

            Alpine.data('bkuApp', () => ({
                isSubmitting: false, isLoadingData: true,
                transactions: [], unsubscribe: null, editId: null,
                saldoPindahan: 0,
                isTransactionModalOpen: false,
                selectedMonth: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })(),
                form: { type: 'income', date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' },
                searchQuery: '',

                init() { this.fetchTransactions(); },
                openAddModal() { this.editId = null; this.form = { type: 'income', date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' }; this.isTransactionModalOpen = true; },
                
                formatBulanTahun(val) {
                    if (!val) return '';
                    const parts = val.split('-');
                    if(parts.length !== 2) return val;
                    const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
                    return `${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
                },

                async fetchTransactions() {
                    this.isLoadingData = true;
                    try {
                        this.saldoPindahan = await FinanceService.getPreviousBalance(this.selectedMonth);
                    } catch (error) {
                        console.error("Gagal menghitung saldo pindahan:", error);
                        this.saldoPindahan = 0;
                    }

                    if (this.unsubscribe) this.unsubscribe();
                    this.unsubscribe = FinanceService.listenTransactions(this.selectedMonth, (data, error) => {
                        this.transactions = data; 
                        this.isLoadingData = false;
                    });
                },
                formatRupiah(angka) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka); },
                get totalIncome() { return this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0); },
                get totalExpense() { return this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0); },
                
                get filteredTransactions() {
                    if (!this.searchQuery.trim()) return this.transactions;
                    const q = this.searchQuery.toLowerCase().trim();
                    return this.transactions.filter(t => t.description && t.description.toLowerCase().includes(q));
                },
                
                get processedTransactions() {
                    let currentSaldo = this.saldoPindahan; 
                    return this.transactions.map(trx => {
                        const amount = Number(trx.amount) || 0;
                        if (trx.type === 'income') currentSaldo += amount; else currentSaldo -= amount;
                        return { ...trx, saldo: currentSaldo };
                    });
                },
                editTransaction(trx) { this.editId = trx.id; this.form = { type: trx.type, date: trx.date, category: trx.category, description: trx.description, amount: trx.amount }; this.isTransactionModalOpen = true; },
                
                executeDeleteTransaction(id) {
                    window.dispatchEvent(new CustomEvent('show-confirm', {
                        detail: {
                            title: 'Hapus Transaksi?', 
                            message: 'Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?', 
                            onConfirm: async () => { 
                                try {
                                    const trxToDelete = this.transactions.find(t => t.id === id);
                                    if (trxToDelete && trxToDelete.related_sekolah_id && trxToDelete.related_pertemuan) {
                                        const payload = {}; 
                                        payload[trxToDelete.related_pertemuan] = false;
                                        await IuranService.updateIuran(trxToDelete.related_sekolah_id, payload);
                                    }
                                    await FinanceService.deleteTransaction(id); 
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Transaksi berhasil dihapus.'}}));
                                } catch (error) {
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Gagal', message: 'Gagal menghapus: ' + error.message}}));
                                }
                            }
                        }
                    }));
                },

                async submitTransaction() {
                    this.isSubmitting = true;
                    try {
                        const currentUser = auth.currentUser;
                        if (this.editId) await FinanceService.updateTransaction(this.editId, this.form);
                        else await FinanceService.addTransaction(this.form, currentUser.uid);
                        
                        this.isTransactionModalOpen = false; this.editId = null;
                        this.form.category = ''; this.form.description = ''; this.form.amount = '';
                        if(this.form.date.substring(0,7) !== this.selectedMonth) { this.selectedMonth = this.form.date.substring(0,7); this.fetchTransactions(); }
                    } catch (error) { 
                         window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Gagal', message: error.message}}));
                    } 
                    finally { this.isSubmitting = false; }
                }
            }));

            Alpine.data('iuranApp', () => ({
                iuranList: [], isLoading: true, isModalOpen: false, editId: null,
                form: { nama_sekolah: '', nama_guru: '' }, unsubscribe: null,
                
                isPembayaranModalOpen: false, isSubmittingForm: false,
                formPembayaran: { sekolah_id: '', pertemuan: 'p1', tanggal: new Date().toISOString().split('T')[0], nominal: 50000 },

                init() {
                    this.unsubscribe = IuranService.listenIuran((data) => { this.iuranList = data; this.isLoading = false; });
                },
                
                openModal() { this.editId = null; this.form = { nama_sekolah: '', nama_guru: '' }; this.isModalOpen = true; },
                closeModal() { this.isModalOpen = false; },
                executeEditData(item) { this.editId = item.id; this.form = { nama_sekolah: item.nama_sekolah, nama_guru: item.nama_guru }; this.isModalOpen = true; },
                
                async submitData() {
                    try { if (this.editId) await IuranService.updateIuran(this.editId, this.form); else await IuranService.addIuran(this.form); this.closeModal(); } 
                    catch (e) { window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Error', message: 'Gagal menyimpan data sekolah.'}})); }
                },
                
                executeDeleteData(id) { 
                    window.dispatchEvent(new CustomEvent('show-confirm', {
                        detail: {
                            title: 'Hapus Data Sekolah?', 
                            message: 'Apakah Anda yakin ingin menghapus data sekolah ini?', 
                            onConfirm: async () => { await IuranService.deleteIuran(id); }
                        }
                    }));
                },
                
                async handleIuranClick(item, fieldPertemuan, currentStatus) {
                    // Jika status saat ini false/undefined/null, buka modal pembayaran
                    if (!currentStatus) {
                        this.formPembayaran = {
                            sekolah_id: item.id,
                            pertemuan: fieldPertemuan,
                            tanggal: new Date().toISOString().split('T')[0],
                            nominal: this.$store.config.nominalIuran 
                        };
                        this.isPembayaranModalOpen = true;
                    } else if (currentStatus === 'skip') {
                        // Jika status 'skip', konfirmasi untuk membatalkan
                        window.dispatchEvent(new CustomEvent('show-confirm', {
                            detail: {
                                title: 'Batalkan Status "-"?',
                                message: 'Apakah Anda yakin ingin membatalkan status "tidak perlu bayar" pada pertemuan ini?\n\nStatus akan dikembalikan menjadi Belum Bayar.',
                                onConfirm: async () => {
                                    try {
                                        const updateData = {};
                                        updateData[fieldPertemuan] = false;
                                        await IuranService.updateIuran(item.id, updateData);
                                        window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Status "-" berhasil dibatalkan.\nPertemuan ini kembali ke status Belum Bayar.'}}));
                                    } catch (error) {
                                        window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Gagal', message: 'Gagal membatalkan status: ' + error.message}}));
                                    }
                                }
                            }
                        }));
                    } else {
                        // Jika sudah bayar (true), beri tahu untuk hapus via BKU
                        window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Penghapusan Ditolak', message: '⚠️ Untuk menjaga keamanan arus kas, pembatalan iuran (hapus ceklis) hanya bisa dilakukan dengan cara menghapus transaksi yang bersangkutan di tab "Buku Kas" (Riwayat BKU).'}}));
                    }
                },

                hitungTotal(item) {
                    const count = [item.p1, item.p2, item.p3, item.p4, item.p5, item.p6].filter(v => v === true).length;
                    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(count * this.$store.config.nominalIuran);
                },

                openPembayaranModal() {
                    this.formPembayaran = { sekolah_id: '', pertemuan: 'p1', tanggal: new Date().toISOString().split('T')[0], nominal: this.$store.config.nominalIuran };
                    this.isPembayaranModalOpen = true;
                },
                closePembayaranModal() { this.isPembayaranModalOpen = false; },
                
                isPertemuanPaid(sekolahId, p) {
                    if (!sekolahId) return false;
                    const sekolah = this.iuranList.find(s => s.id === sekolahId);
                    if (!sekolah) return false;
                    // Return true if already paid (true) or skipped ('skip')
                    return sekolah[p] === true || sekolah[p] === 'skip';
                },
                
                autoSelectPertemuan() {
                    const sekolahId = this.formPembayaran.sekolah_id;
                    if (sekolahId) {
                        const sekolah = this.iuranList.find(s => s.id === sekolahId);
                        if (sekolah) {
                            // Cari pertemuan yang belum dibayar (false, undefined, atau null)
                            const unpaid = ['p1','p2','p3','p4','p5','p6'].find(p => !sekolah[p]);
                            this.formPembayaran.pertemuan = unpaid || ''; 
                        }
                    }
                },

                async submitPembayaranIuran() {
                    if(!this.formPembayaran.sekolah_id) { window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Perhatian', message: 'Pilih sekolah terlebih dahulu'}})); return; }
                    if(!this.formPembayaran.pertemuan) { window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Perhatian', message: 'Pilih pertemuan yang akan dibayar'}})); return; }
                    
                    this.isSubmittingForm = true;
                    try {
                        const currentUser = auth.currentUser;
                        const nominalInput = Number(this.formPembayaran.nominal) || 0;
                        const isSkipMode = this.formPembayaran.pertemuan === 'skip';
                        
                        const updateData = {};
                        // Jika memilih "-" (skip), simpan string 'skip', jika tidak simpan true
                        if (isSkipMode) {
                            // Cari pertemuan yang belum diisi untuk skip
                            const sekolah = this.iuranList.find(s => s.id === this.formPembayaran.sekolah_id);
                            if (sekolah) {
                                const unpaidPertemuan = ['p1','p2','p3','p4','p5','p6'].find(p => !sekolah[p]);
                                if (unpaidPertemuan) {
                                    updateData[unpaidPertemuan] = 'skip';
                                } else {
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Perhatian', message: 'Semua pertemuan sudah terisi.'}}));
                                    this.isSubmittingForm = false;
                                    return;
                                }
                            }
                        } else {
                            updateData[this.formPembayaran.pertemuan] = true;
                        }
                        
                        await IuranService.updateIuran(this.formPembayaran.sekolah_id, updateData);

                        // Hanya tambah ke BKU jika bukan mode skip dan nominal > 0
                        if (!isSkipMode && nominalInput > 0) {
                            const sekolahTerpilih = this.iuranList.find(s => s.id === this.formPembayaran.sekolah_id);
                            const namaSekolah = sekolahTerpilih ? sekolahTerpilih.nama_sekolah : 'Sekolah';
                            const bkuPayload = {
                                type: 'income',
                                amount: nominalInput,
                                category: 'Iuran Bulanan',
                                description: `Iuran ${namaSekolah} (${this.formPembayaran.pertemuan.toUpperCase()})`,
                                date: this.formPembayaran.tanggal,
                                related_sekolah_id: this.formPembayaran.sekolah_id,
                                related_pertemuan: this.formPembayaran.pertemuan 
                            };
                            await FinanceService.addTransaction(bkuPayload, currentUser.uid);
                            this.closePembayaranModal();
                            
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('change-tab', { detail: 'kas' }));
                            }, 300);
                        } else if (isSkipMode) {
                            window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Status "-" (tidak bayar) berhasil disimpan.\nTidak ada transaksi yang dimasukkan ke Buku Kas (BKU).'}}));
                            this.closePembayaranModal();
                        } else {
                            window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Ceklis iuran historis berhasil disimpan.\nTidak ada transaksi yang dimasukkan ke Buku Kas (BKU) karena nominal Rp 0.'}}));
                            this.closePembayaranModal();
                        }

                    } catch (error) {
                        window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Kesalahan', message: 'Terjadi kesalahan: ' + error.message}}));
                    } finally {
                        this.isSubmittingForm = false;
                    }
                }
            }));

            Alpine.data('settingApp', () => ({
                isResetting: false,
                isResettingBKU: false,
                saveConfig() {
                    this.$store.config.saveConfig();
                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Nominal iuran default berhasil diperbarui.'}}));
                },
                resetIuran() {
                    window.dispatchEvent(new CustomEvent('show-confirm', {
                        detail: {
                            title: 'PERINGATAN BAHAYA!',
                            message: 'Apakah Anda yakin ingin MENGHAPUS SEMUA CEKLIS (P1-P6) pada Data Iuran Sekolah?\n\nTindakan ini tidak akan menghapus riwayat di Buku Kas, tetapi akan mengubah status tabel iuran seluruh sekolah menjadi Belum Bayar.',
                            onConfirm: async () => {
                                this.isResetting = true;
                                try {
                                    await IuranService.resetSemuaIuran();
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Berhasil me-reset seluruh ceklis iuran sekolah.'}}));
                                } catch (error) {
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Gagal', message: 'Gagal melakukan reset data: ' + error.message}}));
                                } finally {
                                    this.isResetting = false;
                                }
                            }
                        }
                    }));
                },
                resetBKU() {
                    window.dispatchEvent(new CustomEvent('show-confirm', {
                        detail: {
                            title: 'HAPUS SEMUA BKU?',
                            message: 'PERINGATAN: Tindakan ini akan MENGHAPUS PERMANEN seluruh data transaksi dari awal sampai akhir!\n\n(Pastikan Rules Firestore Anda mengizinkan proses delete).',
                            onConfirm: async () => {
                                this.isResettingBKU = true;
                                try {
                                    await FinanceService.deleteAllTransactions();
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Berhasil', message: 'Seluruh riwayat transaksi BKU berhasil dikosongkan.'}}));
                                    window.dispatchEvent(new CustomEvent('change-tab', { detail: 'kas' }));
                                } catch (error) {
                                    window.dispatchEvent(new CustomEvent('show-alert', {detail: {title: 'Penghapusan Ditolak', message: 'Gagal menghapus data BKU. Terdapat data yang dikunci oleh Security Rules atau Anda tidak memiliki akses.\n\nDetail: ' + error.message}}));
                                } finally {
                                    this.isResettingBKU = false;
                                }
                            }
                        }
                    }));
                }
            }));

        });

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => { console.log('✅ PWA Service Worker terdaftar'); })
                    .catch(err => { console.log('Catatan PWA: SW tidak diwajibkan untuk dev lokal.'); });
            });
        }

        window.Alpine = Alpine;
        Alpine.start();
    </script>
</body>
</html>
