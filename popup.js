document.addEventListener('DOMContentLoaded', () => {
    
    // --- CUSTOM DROPDOWN LOGIC ---
    const customSelect = document.getElementById('customSelect');
    const customOptions = document.getElementById('customOptions');
    const selectedText = document.getElementById('selectedCidrText');
    const hiddenInput = document.getElementById('cidrValue');
    
    // Seçenekleri Oluştur (32'den 1'e)
    for (let i = 32; i >= 1; i--) {
        const div = document.createElement('div');
        div.classList.add('custom-option');
        
        // Etiketleri hazırla
        let label = `/${i}`;
        if (i === 32) label += " (Single Host)";
        if (i === 30) label += " (P2P Link)";
        if (i === 24) label += " (Standard LAN)";
        if (i === 16) label += " (Class B)";
        if (i === 8)  label += " (Class A)";
        
        div.textContent = label;
        div.dataset.value = i;
        
        if (i === 24) div.classList.add('selected');

        // Tıklama olayı
        div.addEventListener('click', () => {
            selectedText.textContent = label;
            hiddenInput.value = i;
            
            // Görsel seçimi güncelle
            document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
            div.classList.add('selected');
        });

        customOptions.appendChild(div);
    }

    // Menüyü Aç/Kapa
    customSelect.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });

    // Dışarı tıklayınca kapat
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    // --- HESAPLAMA MOTORU ---
    const calcBtn = document.getElementById('calcBtn');
    const ipInput = document.getElementById('ipInput');
    const resultsArea = document.getElementById('resultsArea');

    calcBtn.addEventListener('click', calculateSubnet);
    ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateSubnet();
    });

    // Kopyalama Butonları
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            const text = document.getElementById(targetId).innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const originalHTML = btn.innerHTML;
                // Check işareti
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#22c55e" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                }, 1500);
            });
        });
    });

    function calculateSubnet() {
        const ip = ipInput.value.trim();
        const cidr = parseInt(hiddenInput.value); // Gizli inputtan değeri al

        if (!validateIP(ip)) {
            shakeInput(ipInput);
            return;
        }

        const ipLong = ip2long(ip);
        const maskLong = ~((1 << (32 - cidr)) - 1);
        
        const networkLong = ipLong & maskLong;
        const broadcastLong = networkLong | (~maskLong);
        
        let firstIpLong = networkLong + 1;
        let lastIpLong = broadcastLong - 1;
        let hosts = Math.pow(2, 32 - cidr) - 2;

        if (cidr === 32) {
            firstIpLong = networkLong;
            lastIpLong = networkLong;
            hosts = 1;
        } else if (cidr === 31) {
            firstIpLong = networkLong;
            lastIpLong = broadcastLong;
            hosts = 2;
        }

        // Sonuçları Yaz
        updateResult('res-network', long2ip(networkLong) + ` /${cidr}`);
        updateResult('res-broadcast', long2ip(broadcastLong));
        updateResult('res-first', long2ip(firstIpLong));
        updateResult('res-last', long2ip(lastIpLong));
        updateResult('res-hosts', new Intl.NumberFormat().format(hosts > 0 ? hosts : 0));

        // Animasyon
        resultsArea.classList.remove('hidden');
        setTimeout(() => {
            resultsArea.classList.remove('opacity-0', 'translate-y-4');
        }, 10);
    }

    // --- YARDIMCI FONKSİYONLAR ---
    function ip2long(ip) {
        let components = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
        if(components) {
            let ipl = 0;
            components.shift();
            components.forEach(function(octet) {
                ipl = (ipl << 8) + parseInt(octet);
            });
            return ipl >>> 0;
        }
    }

    function long2ip(ipl) {
        return ( (ipl>>>24) +'.' +
            (ipl>>16 & 255) +'.' +
            (ipl>>8 & 255) +'.' +
            (ipl & 255) );
    }

    function validateIP(ip) {
        const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return regex.test(ip);
    }

    function updateResult(id, value) {
        document.getElementById(id).innerText = value;
    }

    function shakeInput(element) {
        element.style.borderColor = '#ef4444';
        element.style.color = '#f87171';
        element.style.transform = "translateX(5px)";
        setTimeout(() => element.style.transform = "translateX(-5px)", 100);
        setTimeout(() => element.style.transform = "translateX(5px)", 200);
        setTimeout(() => {
            element.style.transform = "translateX(0)";
            element.style.borderColor = '#374151';
            element.style.color = 'white';
        }, 300);
    }
});