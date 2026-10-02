(() => {
  const STORAGE={history:'b2bDemoHistory',delivery:'b2bDemoDelivery'};
  const warehouseStock={
    1:[{id:'krsk',name:'Красноярск',qty:8,eta:'сегодня или завтра'},{id:'msk',name:'Москва',qty:14,eta:'4–6 дней'}],
    2:[{id:'krsk',name:'Красноярск',qty:3,eta:'1–2 дня'},{id:'msk',name:'Москва',qty:21,eta:'4–6 дней'}],
    3:[{id:'krsk',name:'Красноярск',qty:24,eta:'сегодня'},{id:'msk',name:'Москва',qty:40,eta:'4–6 дней'}],
    4:[{id:'krsk',name:'Красноярск',qty:2,eta:'1–2 дня'},{id:'msk',name:'Москва',qty:9,eta:'4–6 дней'}],
    5:[{id:'krsk',name:'Красноярск',qty:5,eta:'1–2 дня'},{id:'msk',name:'Москва',qty:11,eta:'4–6 дней'}],
    6:[{id:'supplier',name:'Склад поставщика',qty:0,eta:'10–14 дней, под заказ'}],
    7:[{id:'krsk',name:'Красноярск',qty:36,eta:'сегодня'},{id:'msk',name:'Москва',qty:62,eta:'4–6 дней'}],
    8:[{id:'krsk',name:'Красноярск',qty:1,eta:'1–2 дня'},{id:'msk',name:'Москва',qty:6,eta:'5–7 дней'}]
  };
  const defaultDelivery={method:'Курьерская доставка',city:'Красноярск',address:'ул. Дубровинского, 54А',entrance:'Вход со стороны набережной',recipient:'Анна Петрова',phone:'+7 913 555-24-18',window:'Будни, 10:00–18:00'};
  const demoHistory=[
    {number:'1044',date:'28 сентября 2026',iso:'2026-09-28',total:15560,qty:4,status:'В пути',statusKey:'transit',payment:'Оплачен картой',delivery:{method:'Курьерская доставка',address:'Красноярск, ул. Дубровинского, 54А',eta:'Сегодня, 14:00–18:00',track:'TL-240928-1044'},items:[{id:1,name:'Лампа для маникюра RAY',sku:'RAY-LAMP-01',price:6490,qty:1},{id:2,name:'Лампа SUN 1 SE',sku:'SUN-1-SE',price:5290,qty:1},{id:3,name:'Емкость под стерилизацию',sku:'TH-EM-350',price:1890,qty:2}],timeline:4,documents:['Чек об оплате','Товарная накладная']},
    {number:'1031',date:'15 сентября 2026',iso:'2026-09-15',total:23880,qty:4,status:'Доставлен',statusKey:'delivered',payment:'Расчётный счёт',delivery:{method:'Транспортная компания',address:'Красноярск, терминал получателя',eta:'Доставлен 19 сентября',track:'ДЛ-778144'},items:[{id:4,name:'Машинка для стрижки A20 ФЛАРЭЙ',sku:'FLAREY-A20',price:7850,qty:2},{id:5,name:'Настольная УФ-лампа для ресниц',sku:'LASH-UV-01',price:7290,qty:1},{id:7,name:'DGP крем для ног, 250 мл',sku:'DGP-FOOT-250',price:890,qty:1}],timeline:5,documents:['Счёт № DEMO-1031','УПД · демо']},
    {number:'1018',date:'30 августа 2026',iso:'2026-08-30',total:8890,qty:1,status:'Доставлен',statusKey:'delivered',payment:'СБП',delivery:{method:'Самовывоз',address:'Пункт выдачи поставщика',eta:'Получен 1 сентября',track:'—'},items:[{id:8,name:'Тележка для косметологов CY504',sku:'CY504',price:8890,qty:1}],timeline:5,documents:['Чек об оплате','Накладная · демо']}
  ];
  let orderFilter='all',historySearch='';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch(e){return fallback}};
  const getDelivery=()=>({...defaultDelivery,...read(STORAGE.delivery,{})});
  const getHistory=()=>{const stored=read(STORAGE.history,[]);return [...stored,...demoHistory.filter(d=>!stored.some(s=>s.number===d.number))]};
  const formatMoney=n=>new Intl.NumberFormat('ru-RU').format(Number(n)||0)+' ₽';
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  state.fulfillment=read('b2bDemoFulfillment',{});
  const stockFor=id=>warehouseStock[id]||[{id:'supplier',name:'Склад поставщика',qty:0,eta:'срок уточняется'}];
  const selectedStock=id=>{const list=stockFor(id),saved=state.fulfillment[id];return list.find(w=>w.id===saved?.id)||list.find(w=>w.qty>0)||list[0]};
  const saveFulfillment=()=>localStorage.setItem('b2bDemoFulfillment',JSON.stringify(state.fulfillment));

  const baseRenderProducts=renderProducts;
  renderProducts=function(){
    baseRenderProducts();
    document.querySelectorAll('.product').forEach(card=>{
      const add=card.querySelector('[data-add]');if(!add)return;
      const id=Number(add.dataset.add),selected=selectedStock(id),picker=document.createElement('label');
      picker.className='warehouse-picker';picker.innerHTML=`<span>Откуда доставить</span><select class="warehouse-select" data-warehouse-select="${id}" aria-label="Склад для товара"><option value="">Выберите склад</option>${stockFor(id).map(w=>`<option value="${w.id}" ${w.id===selected.id?'selected':''}>${escapeHtml(w.name)} · ${w.qty?`${w.qty} шт.`:'под заказ'} · ${escapeHtml(w.eta)}</option>`).join('')}</select><small class="stock-hint"><i class="stock-dot ${selected.qty?'':'warn'}"></i>${selected.qty?`В наличии: ${selected.qty} шт. · ${escapeHtml(selected.eta)}`:`Под заказ · ${escapeHtml(selected.eta)}`}</small>`;
      card.querySelector('.product-actions').before(picker);
      picker.querySelector('select').onchange=e=>{const w=stockFor(id).find(item=>item.id===e.target.value);if(w){state.fulfillment[id]=w;saveFulfillment();renderProducts()}};
      add.onclick=()=>{const w=selectedStock(id);state.fulfillment[id]=w;saveFulfillment();state.cart[id]=(state.cart[id]||0)+1;toast(`${w.name}: товар добавлен в корзину`);render()};
    });
  };

  const baseRenderCart=renderCart;
  renderCart=function(){baseRenderCart();document.querySelectorAll('.cart-line').forEach((line,index)=>{const entries=Object.entries(state.cart).filter(([,n])=>n>0),id=Number(entries[index]?.[0]);if(!id)return;const w=selectedStock(id),note=line.querySelector('small');if(note)note.insertAdjacentHTML('afterend',`<small class="line-source">${escapeHtml(w.name)} · ${escapeHtml(w.eta)}</small>`)});};

  openProduct=function(id){
    const p=products.find(item=>item.id===id);if(!p)return;const category=categories.find(item=>item[0]===p.cat)?.[1]||'',selected=selectedStock(id),specs=[['Категория',category],['Артикул',p.sku],['Доступность',p.stock?'В наличии':'Под заказ'],...p.specs];
    openModal('Карточка товара',p.name,`<div class="product-detail"><div class="product-visual has-image"><img class="product-photo" src="${p.image}" alt="${escapeHtml(p.name)}"><span class="product-code">${p.code}</span></div><div class="product-detail-copy"><div class="badges"><span class="badge">${category}</span><span class="badge ${p.stock?'in':''}">${p.stock?'В наличии':'Под заказ'}</span></div><p class="product-description">${p.description}</p><strong class="price">${formatMoney(p.price)}<small class="price-note">Демонстрационная цена в рублях</small></strong><div class="spec-list">${specs.map(([label,value])=>`<div class="spec-row"><span>${label}</span><b>${value}</b></div>`).join('')}</div><div class="warehouse-options"><h3>Выберите склад и срок</h3>${stockFor(id).map(w=>`<label class="warehouse-option"><input type="radio" name="warehouse" value="${w.id}" ${w.id===selected.id?'checked':''}><span><b>${escapeHtml(w.name)}</b><small>${w.qty?`Доступно ${w.qty} шт.`:'Поставка под заказ'}</small></span><strong>${escapeHtml(w.eta)}<small>до Красноярска</small></strong></label>`).join('')}</div><div class="modal-actions"><button class="secondary" type="button" data-modal-close>Вернуться</button><button class="primary" type="button" id="modalAddProduct">Добавить в корзину</button></div></div></div>`);
    document.getElementById('modalAddProduct').onclick=()=>{const selectedId=modalContent.querySelector('input[name="warehouse"]:checked')?.value,w=stockFor(id).find(item=>item.id===selectedId)||selectedStock(id);state.fulfillment[id]=w;saveFulfillment();state.cart[id]=(state.cart[id]||0)+1;render();closeModal();toast(`${w.name}: товар добавлен в корзину`)};modalContent.querySelector('[data-modal-close]').onclick=closeModal;
  };

  function selectPartnerView(view){
    document.querySelectorAll('[data-partner-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.partnerPanel===view));
    document.querySelectorAll('.partner-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.partnerView===view));
    document.querySelector('.customer-view').classList.toggle('show-catalog',view==='catalog');
    closeCart();
    if(view==='orders')renderPartnerOrders();
    if(view==='delivery')renderPartnerProfile();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderPartnerOrders(){
    const orders=getHistory();
    const active=orders.filter(o=>!['delivered','cancelled'].includes(o.statusKey));
    const last=orders[0];
    document.getElementById('activeOrderBadge').textContent=active.length;
    document.getElementById('orderOverview').innerHTML=`<article class="partner-card overview-card primary-overview"><span>Ближайшая поставка</span><strong>${last?escapeHtml(last.delivery?.eta||'Срок уточняется'):'Нет активных поставок'}</strong><small>${last?`Заказ № ${escapeHtml(last.number)} · ${escapeHtml(last.status)}`:'Оформите новый заказ в каталоге'}</small></article><article class="partner-card overview-card"><span>Активные заказы</span><strong>${active.length}</strong><small>Все изменения видны здесь</small></article><article class="partner-card overview-card"><span>Заказов за 30 дней</span><strong>${orders.filter(o=>o.iso>='2026-09-01').length}</strong><small>Можно повторить в один клик</small></article>`;
    const filters=[['all','Все'],['active','Активные'],['transit','В пути'],['delivered','Доставлены'],['payment','Ждут оплаты']];
    document.getElementById('historyFilters').innerHTML=filters.map(([id,label])=>`<button class="history-filter ${orderFilter===id?'active':''}" type="button" data-history-filter="${id}">${label}</button>`).join('');
    const query=historySearch.toLowerCase();
    const list=orders.filter(order=>(orderFilter==='all'||(orderFilter==='active'&&!['delivered','cancelled'].includes(order.statusKey))||order.statusKey===orderFilter)&&(`${order.number} ${order.items.map(i=>i.name+' '+i.sku).join(' ')}`.toLowerCase().includes(query)));
    document.getElementById('partnerOrderList').innerHTML=list.length?list.map(order=>`<article class="history-order"><div><h3>№ ${escapeHtml(order.number)}</h3><small>${escapeHtml(order.date)}</small></div><div><b>${order.qty} ${order.qty===1?'товар':'товара'}</b><small>${escapeHtml(order.items.slice(0,2).map(i=>i.name).join(', '))}${order.items.length>2?'…':''}</small></div><strong class="amount">${formatMoney(order.total)}</strong><div class="delivery-brief">${escapeHtml(order.delivery?.method||'Доставка уточняется')}<small>${escapeHtml(order.delivery?.eta||'')}</small></div><span class="status ${escapeHtml(order.statusKey)}">${escapeHtml(order.status)}</span><div class="history-actions"><button class="round-action" type="button" data-history-open="${escapeHtml(order.number)}" aria-label="Открыть заказ № ${escapeHtml(order.number)}">›</button><button class="round-action" type="button" data-history-repeat="${escapeHtml(order.number)}" aria-label="Повторить заказ № ${escapeHtml(order.number)}">↻</button></div></article>`).join(''):'<div class="empty-history"><b>Заказы не найдены</b><br>Измените фильтр или поисковый запрос.</div>';
    document.querySelectorAll('[data-history-filter]').forEach(btn=>btn.onclick=()=>{orderFilter=btn.dataset.historyFilter;renderPartnerOrders()});
    document.querySelectorAll('[data-history-open]').forEach(btn=>btn.onclick=()=>openPartnerOrder(btn.dataset.historyOpen));
    document.querySelectorAll('[data-history-repeat]').forEach(btn=>btn.onclick=()=>repeatPartnerOrder(btn.dataset.historyRepeat));
  }

  function timelineHtml(order){
    const steps=[['Заказ создан',order.date],['Оплата подтверждена',order.payment],['Передан в доставку',order.delivery?.method||'Способ уточняется'],['В пути',order.delivery?.eta||'Срок уточняется'],['Получен','Заказ закрыт']];
    return steps.map((step,index)=>{const n=index+1,done=n<order.timeline,current=n===order.timeline;return `<div class="timeline-step ${done?'done':''} ${current?'current':''}"><i>${done?'✓':n}</i><div><b>${escapeHtml(step[0])}</b><br>${escapeHtml(step[1])}</div></div>`}).join('');
  }

  function openPartnerOrder(number){
    const order=getHistory().find(o=>o.number===String(number));if(!order)return;
    openModal('Заказ партнёра',`Заказ № ${order.number}`,`<div class="order-hero"><div class="order-fact"><span>Статус</span><strong>${escapeHtml(order.status)}</strong></div><div class="order-fact"><span>Сумма</span><strong>${formatMoney(order.total)}</strong></div><div class="order-fact"><span>Оплата</span><strong>${escapeHtml(order.payment)}</strong></div></div><div class="order-detail-grid"><section class="detail-section"><h3>Состав заказа</h3>${order.items.map(i=>`<div class="order-line"><div><b>${escapeHtml(i.name)}</b><small>${escapeHtml(i.sku)} · ${i.qty} шт.</small></div><strong>${formatMoney(i.price*i.qty)}</strong></div>`).join('')}</section><section class="detail-section"><h3>Доставка и отслеживание</h3><div class="delivery-box"><b>${escapeHtml(order.delivery?.method||'Уточняется')}</b><span>${escapeHtml(order.delivery?.address||'Адрес будет подтверждён')}</span><span><b>${escapeHtml(order.delivery?.eta||'Срок уточняется')}</b></span>${order.delivery?.track&&order.delivery.track!=='—'?`<div class="track-code"><span>Трек-номер</span><b>${escapeHtml(order.delivery.track)}</b></div>`:''}</div><div class="timeline">${timelineHtml(order)}</div></section></div><section class="detail-section" style="margin-top:15px"><h3>Документы</h3><div class="doc-list">${(order.documents||['Счёт · демо']).map(doc=>`<div class="doc-row"><div><b>${escapeHtml(doc)}</b><small>Демонстрационный документ</small></div><button class="soft-action" type="button" data-demo-doc>Открыть</button></div>`).join('')}</div></section><div class="manager-note"><div><b>Нужна помощь по заказу?</b><p>Сообщение автоматически будет связано с номером заказа.</p></div><button class="secondary" type="button" data-manager-help="${escapeHtml(order.number)}">Связаться с менеджером</button></div><div class="modal-actions"><button class="secondary" type="button" data-modal-close>Закрыть</button><button class="primary" type="button" data-repeat-modal="${escapeHtml(order.number)}">Повторить заказ</button></div>`,true);
    modalContent.querySelector('[data-modal-close]').onclick=closeModal;
    modalContent.querySelector('[data-repeat-modal]').onclick=()=>repeatPartnerOrder(order.number);
    modalContent.querySelector('[data-manager-help]').onclick=()=>openManagerRequest(order.number);
    modalContent.querySelectorAll('[data-demo-doc]').forEach(btn=>btn.onclick=()=>toast('Демо: документ откроется после интеграции'));
  }

  function repeatPartnerOrder(number){
    const order=getHistory().find(o=>o.number===String(number));if(!order)return;
    const unavailable=[];let added=0;
    order.items.forEach(item=>{const current=products.find(p=>p.id===Number(item.id)||p.sku===item.sku);if(current&&current.stock){state.cart[current.id]=(state.cart[current.id]||0)+item.qty;state.fulfillment[current.id]=selectedStock(current.id);added+=item.qty}else unavailable.push(item.name)});saveFulfillment();
    render();closeModal();selectPartnerView('catalog');openCart();
    toast(unavailable.length?`Добавлено ${added}. ${unavailable.length} поз. требуют уточнения`:`Заказ № ${number} добавлен в корзину`);
  }

  function renderPartnerProfile(){
    const d=getDelivery();
    document.getElementById('savedAddressCard').innerHTML=`<div class="profile-main">${escapeHtml(d.city)}, ${escapeHtml(d.address)}</div><div class="profile-meta">${escapeHtml(d.entrance)}<br>${escapeHtml(d.window)}</div><span class="profile-tag">Использовать по умолчанию</span>`;
    document.getElementById('savedRecipientCard').innerHTML=`<div class="profile-main">${escapeHtml(d.recipient)}</div><div class="profile-meta">${escapeHtml(d.phone)}<br>Контакт для курьера и уведомлений</div><span class="profile-tag">Подтверждён в демо</span>`;
  }

  function openProfileEditor(mode){
    const d=getDelivery(),isAddress=mode==='address';
    openModal('Профиль доставки',isAddress?'Изменить адрес':'Изменить получателя',`<form id="profileEditForm"><div class="form-grid">${isAddress?`<label class="form-field"><span>Город</span><input name="city" required value="${escapeHtml(d.city)}"></label><label class="form-field"><span>Адрес</span><input name="address" required value="${escapeHtml(d.address)}"></label><label class="form-field full"><span>Как найти</span><textarea name="entrance">${escapeHtml(d.entrance)}</textarea></label><label class="form-field full"><span>Удобное время</span><input name="window" value="${escapeHtml(d.window)}"></label>`:`<label class="form-field"><span>Имя получателя</span><input name="recipient" required value="${escapeHtml(d.recipient)}"></label><label class="form-field"><span>Телефон</span><input name="phone" required value="${escapeHtml(d.phone)}"></label>`}</div><div class="modal-actions"><button class="secondary" type="button" data-modal-close>Отмена</button><button class="primary" type="submit">Сохранить</button></div></form>`);
    modalContent.querySelector('[data-modal-close]').onclick=closeModal;
    document.getElementById('profileEditForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));localStorage.setItem(STORAGE.delivery,JSON.stringify({...d,...data}));closeModal();renderPartnerProfile();toast('Данные доставки сохранены')};
  }

  function openManagerRequest(number=''){openModal('Поддержка партнёра','Сообщение менеджеру',`<form id="managerRequestForm"><div class="form-grid"><label class="form-field"><span>Тема</span><select name="topic"><option>Срок и доставка</option><option>Изменить заказ</option><option>Оплата и документы</option><option>Возврат или проблема</option></select></label><label class="form-field"><span>Заказ</span><input name="order" value="${number?`№ ${escapeHtml(number)}`:'Без привязки'}" readonly></label><label class="form-field full"><span>Сообщение</span><textarea name="message" required placeholder="Опишите вопрос"></textarea></label></div><div class="modal-actions"><button class="secondary" type="button" data-modal-close>Отмена</button><button class="primary" type="submit">Отправить в демо</button></div></form>`);modalContent.querySelector('[data-modal-close]').onclick=closeModal;document.getElementById('managerRequestForm').onsubmit=e=>{e.preventDefault();modalContent.innerHTML='<div class="success-state"><div class="success-mark">✓</div><h3>Сообщение принято</h3><p>В рабочей версии обращение попадёт менеджеру вместе с данными заказа, а ответ появится в кабинете.</p><div class="modal-actions"><button class="primary" type="button" data-modal-close>Готово</button></div></div>';modalContent.querySelector('[data-modal-close]').onclick=closeModal}};

  document.querySelectorAll('[data-partner-view]').forEach(btn=>btn.addEventListener('click',()=>selectPartnerView(btn.dataset.partnerView)));
  document.getElementById('historySearch').addEventListener('input',e=>{historySearch=e.target.value;renderPartnerOrders()});
  document.getElementById('repeatBtn').onclick=()=>selectPartnerView('orders');
  document.getElementById('editAddressBtn').onclick=()=>openProfileEditor('address');
  document.getElementById('editRecipientBtn').onclick=()=>openProfileEditor('recipient');
  document.getElementById('deliveryHelpBtn').onclick=()=>openManagerRequest();
  document.getElementById('companyCardBtn').onclick=()=>toast('Демо: реквизиты будут загружены из учётной системы');
  document.addEventListener('click',e=>{if(e.target.closest('#checkoutBtn')){e.preventDefault();e.stopImmediatePropagation();const entries=Object.entries(state.cart).filter(([,n])=>n>0),{qty,total}=cartTotals();if(total<3000)return;const order={number:String(1050+read(STORAGE.history,[]).length),createdAt:new Date().toISOString(),items:entries.map(([id,n])=>{const p=products.find(x=>x.id===Number(id)),warehouse=selectedStock(Number(id));return{id:p.id,name:p.name,sku:p.sku,price:p.price,qty:n,warehouse:{id:warehouse.id,name:warehouse.name,eta:warehouse.eta}}}),qty,total};localStorage.setItem('b2bDemoOrder',JSON.stringify(order));location.href='delivery.html'}},true);
  document.querySelector('.customer-view').classList.add('show-catalog');
  renderProducts();renderCart();renderPartnerOrders();renderPartnerProfile();
  if(location.hash==='#orders')selectPartnerView('orders');
})();


[executed on device: mikrolab (3a2bcc24-b4fd-4f1f-b3db-4a316e15f5f7)]