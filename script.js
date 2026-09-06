(function(){
  const STORAGE_KEY = 'catalog:items';
  let catalog = [];
  let estimate = [];

  const galleryGrid = document.getElementById('galleryGrid');
  const itemSelect = document.getElementById('itemSelect');
  const estimateBody = document.getElementById('estimateBody');
  const grandTotalCell = document.getElementById('grandTotal');
  const adminList = document.getElementById('adminList');

  // ---------- placeholder art (inline SVG, per category) ----------
  function placeholderFor(category){
    const c = (category||'').toLowerCase();
    let icon = '';
    if (c.includes('wardrobe')){
      icon = '<rect x="30" y="15" width="60" height="90" rx="2"/><line x1="60" y1="15" x2="60" y2="105"/><circle cx="55" cy="60" r="2"/><circle cx="65" cy="60" r="2"/>';
    } else if (c.includes('bed')){
      icon = '<rect x="15" y="55" width="90" height="35" rx="3"/><rect x="15" y="40" width="20" height="20" rx="2"/><rect x="20" y="90" width="6" height="12"/><rect x="94" y="90" width="6" height="12"/>';
    } else if (c.includes('kitchen')){
      icon = '<rect x="15" y="45" width="90" height="45" rx="2"/><line x1="15" y1="60" x2="105" y2="60"/><circle cx="35" cy="52" r="2"/><circle cx="55" cy="52" r="2"/><rect x="70" y="20" width="20" height="25" rx="2"/>';
    } else if (c.includes('tv')){
      icon = '<rect x="18" y="30" width="84" height="48" rx="2"/><line x1="52" y1="86" width="16" height="0"/><rect x="52" y="82" width="16" height="6"/>';
    } else {
      icon = '<rect x="20" y="60" width="80" height="35" rx="3"/><rect x="25" y="35" width="70" height="30" rx="3"/>';
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#e7cfa2"/>
      <g fill="none" stroke="#7a4a26" stroke-width="2.5">${icon}</g>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function fmtMoney(n){
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function seedCatalog(){
    return [
      { id: 'seed-hall', name: 'Hall — Wall Panel Design', category: 'Hall', rate: 380, image: '' },
      { id: 'seed-wardrobe', name: 'Wardrobe — 3 Door Sliding', category: 'Wardrobe', rate: 1650, image: '' },
      { id: 'seed-bed', name: 'Bed — Storage Cot with Headboard', category: 'Bed', rate: 1250, image: '' },
      { id: 'seed-kitchen', name: 'Modular Kitchen — L-Shape', category: 'Modular Kitchen', rate: 1450, image: '' }
    ];
  }

  async function loadCatalog(){
    try{
      const res = await window.storage.get(STORAGE_KEY, true);
      catalog = res && res.value ? JSON.parse(res.value) : seedCatalog();
    }catch(e){
      catalog = seedCatalog();
    }
    if(!catalog.length) catalog = seedCatalog();
    renderGallery();
    renderItemSelect();
    renderAdminList();
  }

  async function saveCatalog(){
    try{
      await window.storage.set(STORAGE_KEY, JSON.stringify(catalog), true);
    }catch(e){
      showToast('Could not save — please try again.');
    }
  }

  function renderGallery(){
    if(!catalog.length){
      galleryGrid.innerHTML = '<p class="empty">No designs added yet.</p>';
      return;
    }
    galleryGrid.innerHTML = catalog.map(item => `
      <div class="card">
        <div class="thumb"><img src="${item.image || placeholderFor(item.category)}" alt="${item.name}"></div>
        <div class="body">
          <div class="cat">${item.category||''}</div>
          <h3>${item.name}</h3>
          <div class="price">From ${fmtMoney(item.rate)} / sq.ft</div>
        </div>
      </div>
    `).join('');
  }

  function renderItemSelect(){
    itemSelect.innerHTML = catalog.map(item =>
      `<option value="${item.id}">${item.name} — ${fmtMoney(item.rate)}/sqft</option>`
    ).join('');
  }

  function renderEstimate(){
    if(!estimate.length){
      estimateBody.innerHTML = '<tr><td colspan="6" class="empty">No items added yet.</td></tr>';
      grandTotalCell.textContent = fmtMoney(0);
      return;
    }
    let total = 0;
    estimateBody.innerHTML = estimate.map((row, i) => {
      total += row.amount;
      return `<tr>
        <td>${row.name}</td>
        <td>${row.h}×${row.w}×${row.d}</td>
        <td>${row.sqft.toFixed(2)}</td>
        <td>${fmtMoney(row.rate)}</td>
        <td>${fmtMoney(row.amount)}</td>
        <td><button class="link" data-remove="${i}">Remove</button></td>
      </tr>`;
    }).join('');
    grandTotalCell.textContent = fmtMoney(total);
  }

  function renderAdminList(){
    if(!catalog.length){
      adminList.innerHTML = '<p class="empty">No items yet — add your first one above.</p>';
      return;
    }
    adminList.innerHTML = catalog.map((item, i) => `
      <div class="item-row">
        <img src="${item.image || placeholderFor(item.category)}" alt="">
        <div>
          <div style="font-weight:600">${item.name}</div>
          <div style="color:#8f8168">${item.category}</div>
        </div>
        <div>₹ <input type="number" data-rate="${i}" value="${item.rate}" style="width:90px;display:inline-block"></div>
        <button class="ghost" data-save="${i}">Save</button>
        <button class="link" data-del="${i}">Delete</button>
      </div>
    `).join('');
  }

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2200);
  }

  // ---------- nav ----------
  const nav = document.getElementById('mainNav');
  document.getElementById('hamburger').addEventListener('click', ()=> nav.classList.toggle('open'));
  document.querySelectorAll('nav button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      document.getElementById('page-' + btn.dataset.page).classList.add('active');
      nav.classList.remove('open');
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  // ---------- estimate builder ----------
  document.getElementById('addItemBtn').addEventListener('click', ()=>{
    const id = itemSelect.value;
    const item = catalog.find(c=>c.id===id);
    if(!item){ showToast('Add a catalog item first from the Admin page.'); return; }
    const h = parseFloat(document.getElementById('dimH').value);
    const w = parseFloat(document.getElementById('dimW').value);
    const d = parseFloat(document.getElementById('dimD').value) || 0;
    if(!h || !w){ showToast('Enter height and width.'); return; }
    const sqft = h * w;
    const amount = sqft * item.rate;
    estimate.push({ name:item.name, h, w, d, sqft, rate:item.rate, amount });
    renderEstimate();
    document.getElementById('dimH').value = '';
    document.getElementById('dimW').value = '';
    document.getElementById('dimD').value = '';
    showToast(item.name + ' added.');
  });

  document.getElementById('clearBtn').addEventListener('click', ()=>{
    estimate = [];
    renderEstimate();
  });

  estimateBody.addEventListener('click', (e)=>{
    if(e.target.dataset.remove !== undefined){
      estimate.splice(Number(e.target.dataset.remove), 1);
      renderEstimate();
    }
  });

  // ---------- PDF export ----------
  document.getElementById('downloadPdfBtn').addEventListener('click', ()=>{
    if(!estimate.length){ showToast('Add at least one item first.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const name = document.getElementById('custName').value || '-';
    const phone = document.getElementById('custPhone').value || '-';

    // header band
    doc.setFillColor(122,74,38);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255,255,255);
    doc.text('Kiran Interior', 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(231,207,162);
    doc.text('Custom Furniture & Interiors — Estimate', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(30,30,30);
    doc.text('Customer: ' + name, 14, 38);
    doc.text('Phone: ' + phone, 14, 44);
    doc.text('Date: ' + new Date().toLocaleDateString('en-IN'), 150, 38);

    let y = 56;
    doc.setDrawColor(184,134,63);
    doc.line(14, y-6, 196, y-6);

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Item', 14, y);
    doc.text('H x W x D (ft)', 84, y);
    doc.text('Sq.ft', 122, y);
    doc.text('Rate/sqft', 142, y);
    doc.text('Amount', 172, y);
    doc.setFont(undefined, 'normal');
    y += 3;
    doc.setDrawColor(220,220,220);
    doc.line(14, y, 196, y);
    y += 7;

    let total = 0;
    estimate.forEach(row=>{
      total += row.amount;
      const lines = doc.splitTextToSize(row.name, 66);
      doc.text(lines, 14, y);
      doc.text(`${row.h} x ${row.w} x ${row.d}`, 84, y);
      doc.text(row.sqft.toFixed(2), 122, y);
      doc.text('Rs.' + Math.round(row.rate).toLocaleString('en-IN'), 142, y);
      doc.text('Rs.' + Math.round(row.amount).toLocaleString('en-IN'), 172, y);
      y += Math.max(8, lines.length * 6);
    });

    doc.setDrawColor(30,30,30);
    doc.line(14, y, 196, y);
    y += 9;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(80,47,22);
    doc.text('Grand Total: Rs.' + Math.round(total).toLocaleString('en-IN'), 130, y);

    y += 18;
    doc.setDrawColor(220,220,220);
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(110,110,110);
    doc.text('This is an estimate; final pricing may vary after site measurement.', 14, y);
    y += 7;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(63,79,58);
    doc.text('Contact Kiran Interior: 9966614471', 14, y);

    doc.save('Kiran-Interior-Estimate.pdf');
    showToast('PDF downloaded.');
  });

  // ---------- WhatsApp share ----------
  document.getElementById('whatsappBtn').addEventListener('click', ()=>{
    if(!estimate.length){ showToast('Add at least one item first.'); return; }
    const name = document.getElementById('custName').value || 'Customer';
    let total = 0;
    let lines = [`*Kiran Interior — Estimate*`, `Customer: ${name}`, ``];
    estimate.forEach(row=>{
      total += row.amount;
      lines.push(`• ${row.name} (${row.h}x${row.w}x${row.d} ft, ${row.sqft.toFixed(2)} sqft) — ${fmtMoney(row.amount)}`);
    });
    lines.push(``, `*Grand Total: ${fmtMoney(total)}*`, ``, `(Please attach the downloaded PDF here)`);
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/919966614471?text=${text}`, '_blank');
  });

  // ---------- admin ----------
  document.getElementById('adminLoginBtn').addEventListener('click', ()=>{
    const pass = document.getElementById('adminPass').value;
    if(pass === 'kiran123'){
      document.getElementById('adminGate').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
    } else {
      showToast('Incorrect password.');
    }
  });
  document.getElementById('adminPass').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') document.getElementById('adminLoginBtn').click();
  });

  function fileToDataUrl(file){
    return new Promise((resolve, reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  const newImageInput = document.getElementById('newImage');
  const newImagePreview = document.getElementById('newImagePreview');
  newImageInput.addEventListener('change', async ()=>{
    if(newImageInput.files[0]){
      const url = await fileToDataUrl(newImageInput.files[0]);
      newImagePreview.src = url;
      newImagePreview.style.display = 'block';
    }
  });

  document.getElementById('addCatalogBtn').addEventListener('click', async ()=>{
    const name = document.getElementById('newName').value.trim();
    const category = document.getElementById('newCategory').value;
    const rate = parseFloat(document.getElementById('newRate').value);
    if(!name || !category || !rate){ showToast('Fill in name, category and rate.'); return; }

    let image = '';
    if(newImageInput.files[0]){
      try{ image = await fileToDataUrl(newImageInput.files[0]); }
      catch(e){ /* falls back to placeholder */ }
    }

    catalog.push({ id: 'item-' + Date.now(), name, category, rate, image });
    await saveCatalog();
    renderGallery(); renderItemSelect(); renderAdminList();
    document.getElementById('newName').value = '';
    document.getElementById('newRate').value = '';
    newImageInput.value = '';
    newImagePreview.style.display = 'none';
    showToast('Item added.');
  });

  adminList.addEventListener('click', async (e)=>{
    if(e.target.dataset.save !== undefined){
      const i = Number(e.target.dataset.save);
      const input = document.querySelector(`[data-rate="${i}"]`);
      catalog[i].rate = parseFloat(input.value) || catalog[i].rate;
      await saveCatalog();
      renderGallery(); renderItemSelect();
      showToast('Rate updated.');
    }
    if(e.target.dataset.del !== undefined){
      const i = Number(e.target.dataset.del);
      catalog.splice(i, 1);
      await saveCatalog();
      renderGallery(); renderItemSelect(); renderAdminList();
      showToast('Item deleted.');
    }
  });

  loadCatalog();
})();
