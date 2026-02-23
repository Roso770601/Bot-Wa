const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// =========================
// SET ADMIN
// =========================
const ADMIN_NUMBER = '6283879923835@c.us'; // GANTI NOMOR ADMIN

// =========================
// MODE DAFTAR ONLINE
// =========================
const daftarOnline = new Set();

// QR
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan QR WhatsApp');
});

// READY
client.on('ready', () => {
    console.log('Bot siap digunakan!');
});

// MESSAGE
client.on('message', async (message) => {

    const text = message.body.trim().toLowerCase();
// =========================
// AUTO BALAS SALAM
// =========================
if (
    text.includes('assalamualaikum') ||
    text.includes('asalamualaikum') ||
    text.includes('assalamu alaikum') ||
    text === 'salam'
) {
    await message.reply(
`Wa'alaikumussalam Wr. Wb. 🙏

Terima kasih telah menghubungi *SDN 1 Sukamanah*.

Silakan pilih menu berikut:

1️⃣ Info sekolah
2️⃣ Pengumuman
3️⃣ Kontak sekolah
4️⃣ Penerimaan Murid Baru
5️⃣ Logo sekolah

Ketik angka sesuai kebutuhan Anda.`
    );
    return;
}

    const menu =
`Terima kasih telah menghubungi *SDN 1 Sukamanah*.

Silakan pilih menu berikut:

1️⃣ Info sekolah
2️⃣ Pengumuman
3️⃣ Kontak sekolah
4️⃣ Penerimaan Murid Baru
5️⃣ Logo sekolah


Balas dengan angka sesuai menu`;

    // =========================
    // MENU 4
    // =========================
    if (text === '4') {
        await message.reply(
`👥 *PENERIMAAN MURID BARU*

Ketik:
4️⃣1️⃣ Persyaratan
4️⃣2️⃣ Daftar Online`
        );
        return;
    }

    // =========================
    // MENU 41
    // =========================
    if (text === '41') {
        await message.reply(
`📋 *Persyaratan Pendaftaran Murid Baru*

1️⃣ Fotokopi KTP Orang Tua/Wali
2️⃣ Fotokopi Kartu Keluarga
3️⃣ Akta Kelahiran

💰 Pendaftaran *GRATIS DAN TIDAK DIPUNGUT BIAYA APAPUN*.`
        );
        return;
    }

    // =========================
    // MENU 42
    // =========================
    if (text === '42') {

    await message.reply(
`📝 *PENDAFTARAN ONLINE*

Silakan isi formulir resmi melalui link berikut:

https://forms.gle/Ej66wF1NeyhLaHfS8

Setelah mengisi, admin akan menghubungi Anda 🙏`
    );

    return;
}


    // =========================
    // TANGKAP NOMOR & SIMPAN
    // =========================
// =========================
// BATAL DAFTAR ONLINE
// =========================
if (
    daftarOnline.has(message.from) &&
    (text === 'batal' || text === 'menu' || text === '0')
) {
    daftarOnline.delete(message.from);

    await message.reply(
`❌ Pendaftaran online dibatalkan.

Anda kembali ke menu utama.`
    );

    await message.reply(menu);
    return;
}

    if (daftarOnline.has(message.from)) {

        const nomor = message.body.trim();

        if (/^08[0-9]{8,12}$/.test(nomor)) {

            const waktu = new Date().toLocaleString('id-ID');

            const data =
`Waktu : ${waktu}
Nomor : ${nomor}
Dari  : ${message.from}

-----------------------------
`;

            // SIMPAN KE FILE daftar.txt
            fs.appendFileSync('daftar.txt', data);

            // BALAS KE USER
            await message.reply(
`✅ Terima kasih.

Nomor ${nomor} telah kami simpan.
Admin akan segera menghubungi Anda 🙏`
            );

            // KIRIM NOTIF KE ADMIN
            await client.sendMessage(ADMIN_NUMBER,
`📢 *PENDAFTAR BARU*

🕒 ${waktu}
📱 Nomor: ${nomor}
👤 Dari: ${message.from}`
            );

            daftarOnline.delete(message.from);

        } else {
            await message.reply("⚠ Format nomor tidak valid. Gunakan format 08xxxxxxxxxx");
        }

        return;
    }

    // =========================
    // MENU LAIN
    // =========================
    if (text === '1') {
        await message.reply(
`🏫 *SDN 1 SUKAMANAH*

📍 Jl. DR. Moch. Hatta No.252
⏰ Senin -Jumat 07.00 – 12.45`
        );
        return;
    }

    if (text === '2') {

    const chat = await message.getChat();

    // Bot terlihat mengetik
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Kirim teks dulu
    await client.sendMessage(message.from,
`📚 *PENGUMUMAN*

Jadwal libur puasa dan hari raya Idul Fitri 1447H/2026M`
    );

    // Bot mengetik lagi
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Kirim gambar
    const filePath = path.join(__dirname, 'gambar', 'images.jpg');

    if (fs.existsSync(filePath)) {
        try {
            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, media);
        } catch (err) {
            console.log('Error kirim gambar:', err);
            await message.reply('Gagal mengirim gambar.');
        }
    } else {
        await message.reply('File gambar tidak ditemukan.');
    }

    return;
}


    if (text === '3') {
        await message.reply("📞 WA Sekolah: 087734686477");
        return;
    }

    if (text === '5') {

        const filePath = path.join(__dirname, 'gambar', 'logo.jpg');

        if (fs.existsSync(filePath)) {
            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, media, {
                caption: '🏫 Logo SDN 1 Sukamanah'
            });
        } else {
            await message.reply('File logo tidak ditemukan.');
        }

        return;
    }

    // DEFAULT
    await message.reply(menu);

});

client.initialize();
