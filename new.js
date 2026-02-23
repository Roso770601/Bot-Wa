const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'log.txt');

// =========================
// LOG FUNCTION
// =========================
function log(msg) {
    const time = new Date().toLocaleString();
    const text = `[${time}] ${msg}\n`;
    console.log(text);
    fs.appendFile(LOG_FILE, text, () => {});
}

// =========================
// TYPING EFFECT (Reusable)
// =========================
async function typing(message, delay = 1500) {
    const chat = await message.getChat();
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, delay));
}

// =========================
// CLIENT SETUP
// =========================
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "sdn1bot" // ganti kalau mau beda
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// =========================
// ANTI SPAM COOLDOWN
// =========================
const cooldown = new Map();
function isCooldown(user) {
    if (cooldown.has(user)) return true;
    cooldown.set(user, true);
    setTimeout(() => cooldown.delete(user), 2000);
    return false;
}

// =========================
// ADMIN LOAD
// =========================
let ADMIN_NUMBERS = [];
if (fs.existsSync('admin.txt')) {
    ADMIN_NUMBERS = fs.readFileSync('admin.txt', 'utf-8')
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
}

// =========================
// STATE
// =========================
const daftarOnline = new Set();
const firstGreeting = new Set();

const menu = `Terima kasih telah menghubungi *SDN 1 Sukamanah*.
Layanan Informasi Digital
Silakan pilih menu berikut:

1️⃣ Info sekolah
2️⃣ Pengumuman
3️⃣ Kontak sekolah
4️⃣ Penerimaan Murid Baru
5️⃣ Logo sekolah
6️⃣ Keunggulan Sekolah
7️⃣ Download File

Balas dengan angka sesuai menu.
Tekan 0 kapan saja untuk kembali.`;

// =========================
// EVENTS
// =========================
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan QR WhatsApp');
});

client.on('ready', () => {
    console.log('Bot siap digunakan!');
});

// =========================
// MAIN MESSAGE HANDLER
// =========================
client.on('message', async (message) => {

    if (isCooldown(message.from)) return;

    const text = message.body.trim().toLowerCase();

    // Kembali ke menu
    if (text === '0') {
        daftarOnline.delete(message.from);
        await message.reply(menu);
        return;
    }

    // Salam
    if (
        text.includes('assalamualaikum') ||
        text.includes('assalamu\'alaikum') ||
        text.includes('asalamualaikum') ||
        text.includes('assalamu alaikum') ||
        text === 'salam'
    ) {
        await message.reply("Wa'alaikumussalam Wr. Wb. 🙏");

        if (!firstGreeting.has(message.from)) {
            const filePath = path.join(__dirname, 'gambar', 'ramadan.jpg');
            if (fs.existsSync(filePath)) {
                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(message.from, media, {
                    caption: '🌙 Marhaban Ya Ramadhan'
                });
            }
            firstGreeting.add(message.from);
        }

        await message.reply("\n" + menu);
        return;
    }

    // MENU 1
    if (text === '1') {
        await typing(message);
        await message.reply(
`🏫 *SDN 1 SUKAMANAH*
📍 Jl. DR. Moch. Hatta No.252
🗺️ https://maps.app.goo.gl/g8LJ9wx391HQ1qTT9
⏰ Senin - Jumat 07.00 – 12.45
📷 IG: sdn1sukamanahcipedes

Tekan 0 untuk kembali.`
        );
        return;
    }
// =========================
    // MENU 2 (PENGUMUMAN + GAMBAR RAMADAN TETAP ADA)
    // =========================
    if (text === '2') {

        const chat = await message.getChat();
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await client.sendMessage(message.from,
`📚 *PENGUMUMAN*

Jadwal libur puasa dan hari raya Idul Fitri 1447H/2026M`
        );

        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 1500));

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

        await message.reply("\nuntuk agenda kegiatan ramadan dan idul fitri lebih lengkap silakan download file di menu download.");
        await message.reply("\nTekan 0 untuk kembali ke menu utama.");
        return;
    }


    // MENU 3
    if (text === '3') {
        await typing(message);
        await message.reply("📞 WA Sekolah: 087734686477\n\nTekan 0 untuk kembali.");
        return;
    }

    // MENU 4
    if (text === '4') {
        await typing(message);
        await message.reply(
`👥 *PENERIMAAN MURID BARU*

4️⃣1️⃣ Persyaratan
4️⃣2️⃣ Daftar Online

Tekan 0 untuk kembali.`
        );
        return;
    }

    // MENU 41
    if (text === '41') {
        await typing(message);
        await message.reply(
`📋 *Persyaratan*
- Fotokopi KTP Orang Tua
- Fotokopi KK
- Akta Kelahiran

💰 GRATIS

Tekan 0 untuk kembali.`
        );
        return;
    }

    // MENU 42
    if (text === '42') {
        await typing(message);
        daftarOnline.add(message.from);
        await message.reply("Silakan kirim nomor HP dengan format 08xxxxxxxxxx");
        return;
    }

    // PROSES DAFTAR
    if (daftarOnline.has(message.from)) {

        const nomor = message.body.trim();

        if (/^08[0-9]{8,12}$/.test(nomor)) {

            const waktu = new Date().toLocaleString('id-ID');
            fs.appendFileSync('daftar.txt',
`Waktu: ${waktu}
Nomor: ${nomor}
Dari : ${message.from}
-----------------\n`);

            await message.reply("✅ Nomor telah kami simpan. Admin akan menghubungi Bapak/Ibu secara langsung melalui telepon untuk memberikan informasi lengkap dan panduan pendaftaran.");

            for (const admin of ADMIN_NUMBERS) {
                await client.sendMessage(admin,
`📢 PENDAFTAR BARU
🕒 ${waktu}
📱 ${nomor}`);
            }

            daftarOnline.delete(message.from);
            return;

        } else {
            await message.reply("Format salah. Gunakan 08xxxxxxxxxx");
            return;
        }
    }
// =========================
    // MENU 5 - LOGO SEKOLAH
    // =========================
    if (text === '5') {
        const filePath = path.join(__dirname, 'gambar', 'logo.jpg');

        if (fs.existsSync(filePath)) {
            const media = MessageMedia.fromFilePath(filePath);
			const chat = await message.getChat();
    await chat.sendStateTyping();

    await new Promise(resolve => setTimeout(resolve, 1500));
            await client.sendMessage(message.from, media, {
                caption: '🏫 Logo SDN 1 Sukamanah\n\nTekan 0 untuk kembali.'
                });
        } else {
            await message.reply('File logo tidak ditemukan.');

	}
        return;
    }


// =========================
    // MENU 6 - KEUNGGULAN
    // =========================
    if (text === '6') {
		const chat = await message.getChat();
    await chat.sendStateTyping();

    await new Promise(resolve => setTimeout(resolve, 1500));
        await message.reply(
`*Keunggulan SDN 1 SUKAMANAH*
- Sekolah ramah anak
- Guru berpengalaman
- Program pendidikan karakter
- Ekstrakurikuler
- Gratis biaya pendidikan
- Lingkungan aman dan nyaman dilengkapi kamera pengawas CCTV 24 jam\n\nTekan 0 untuk kembali.
`
        );
        return;
    }



    // =========================
    // MENU 7 DOWNLOAD
    // =========================
    if (text === '7') {
		const chat = await message.getChat();
    await chat.sendStateTyping();

    await new Promise(resolve => setTimeout(resolve, 1500));
        await message.reply(
`📂 *DOWNLOAD FILE*

7️⃣1️⃣ Formulir Pendaftaran
7️⃣2️⃣ agenda kegiatan bulan ramadhan
7️⃣3️⃣ Kalender Akademik

Tekan 0 untuk kembali.`
        );
        return;
    }

    if (text === '71' || text === '72' || text === '73') {

        let fileName = '';

        if (text === '71') fileName = 'formulir.pdf';
        if (text === '72') fileName = 'agenda kegiatan bulan ramadhan.pdf';
        if (text === '73') fileName = 'kalender.pdf';

        const filePath = path.join(__dirname, 'file', fileName);

        if (fs.existsSync(filePath)) {

            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, media);

            await message.reply("\nTekan 0 untuk kembali ke menu utama.");
        } else {
            await message.reply('⚠ File tidak ditemukan.\n\nTekan 0 untuk kembali.');
        }

        return;
    }


    // DEFAULT
    await message.reply(menu);
});

// =========================
// ERROR HANDLER
// =========================
process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
});

// =========================
// RECONNECT
// =========================
client.on('disconnected', reason => {
    log(`Bot disconnected: ${reason}`);
    setTimeout(() => client.initialize(), 5000);
});

client.initialize();
